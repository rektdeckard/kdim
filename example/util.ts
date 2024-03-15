import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export type FrameOptions = {
  type?: string;
  quality?: number;
}

export type FramesOptions = FrameOptions & {
  count?: number;
  blocking?: boolean;
}

export type VideoOptions = FrameOptions & {
  count?: number;
  fps?: number;
  blocking?: boolean;
}

export function saveAs(data: string | File | Blob | MediaSource, filename: string) {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

export function saveFrame(canvas: HTMLCanvasElement, filename: string, options?: FrameOptions) {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        throw new Error("Unable to create Blob from canvas");
      }
      saveAs(blob, filename);
    },
    options?.type,
    options?.quality,
  );
}

export function saveFrames(
  canvas: HTMLCanvasElement,
  tick: (canvas: HTMLCanvasElement, f: number, dt: number) => void,
  filename?: (f: number, dt: number) => string,
  options: FramesOptions = {},
) {
  const { count = 100, blocking = false, ...frameOptions } = options;

  let t = performance.now();
  let f = 1;
  const fileType = frameOptions?.type?.split("/")[1] ?? "png";
  const currentFilename = filename ?? (() => `${f}.${fileType}`);

  if (blocking) {
    for (; f <= count; f++) {
      const dt = performance.now() - t;
      t += dt;

      tick(canvas, f, dt);
      saveFrame(canvas, currentFilename(f, dt), frameOptions);
    }
  } else {
    (function loop() {
      const dt = performance.now() - t;
      t += dt;

      tick(canvas, f, dt);
      saveFrame(canvas, currentFilename(f, dt), frameOptions);

      if (f >= count) return;
      f++;

      requestAnimationFrame(loop);
    })();
  }
}

export async function saveVideo(
  canvas: HTMLCanvasElement,
  tick: (canvas: HTMLCanvasElement, f: number, dt: number) => void,
  filename?: string,
  options: VideoOptions = {}
) {
  const { count = 100, fps = 30, blocking = false, type = "mp4", ...frameOptions } = options;

  let t = performance.now();
  let f = 1;
  const fileType = type ?? "mp4";
  const fileName = filename ?? `output.${fileType}`;

  const ffmpeg = await (async () => {
    const BASE_URL = "";
    // const BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return ffmpeg;
  })();

  async function writeFrame(): Promise<void> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("Unable to create Blob from canvas"));
          }
          const data = await fetchFile(blob!);
          await ffmpeg.writeFile(`${f}.png`, data);
          resolve();
        }, "png", frameOptions.quality);
    });
  }

  async function transcodeAndSave() {
    // ffmpeg -framerate 30 -start_number 1 -i %1d.png -c:v libx264 -pix_fmt yuv420p out.mp4

    await ffmpeg.exec([
      "-framerate", `${fps}`,
      "-start_number", "1",
      "-i", "%d.png",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      fileName,
    ]);
    const data = await ffmpeg.readFile(fileName);
    const url = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: `video/${fileType}` }));
    saveAs(url, fileName);
  }

  if (blocking) {
    for (; f <= count; f++) {
      const dt = performance.now() - t;
      t += dt;

      tick(canvas, f, dt);
      await writeFrame();
    }
    await transcodeAndSave();
  } else {
    (async function loop() {
      const dt = performance.now() - t;
      t += dt;

      tick(canvas, f, dt);
      await writeFrame();

      if (f >= count) {
        await transcodeAndSave();
        return;
      }
      f++;

      requestAnimationFrame(loop);
    })();
  }
}
