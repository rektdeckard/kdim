import React, {
  RefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTweaks, makeMonitor } from "use-tweaks";
import { Example } from "../utils/Example";
import { Noise } from "kdim";

const WIDTH = 400;
const HEIGHT = 400;

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();
  let { current: noise } = useRef(new Noise.Perlin());
  const ctxRef = useRef(canvasRef.current?.getContext("2d")!);
  const imgRef = useRef(ctxRef.current?.createImageData(WIDTH, HEIGHT));
  let timeRef = useRef(0);

  const { run, speed, freq } = useTweaks(
    "Paramters",
    {
      run: false,
      speed: { value: 0.1, min: 0.005, max: 0.1, step: 0.005 },
      freq: { value: 5, min: 1, max: 100, step: 1 },
    },
    { container: containerRef }
  ) as { run: boolean; speed: number; freq: number };

  useEffect(() => {
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current!.getContext("2d")!;
    }
    if (!imgRef.current) {
      imgRef.current = ctxRef.current!.createImageData(WIDTH, HEIGHT);
    }

    let handle: number;
    (function draw() {
      noise.fill(imgRef.current, {
        freq,
        z: timeRef.current,
      });
      ctxRef.current.putImageData(imgRef.current, 0, 0);
      timeRef.current += speed;
      if (run) {
        handle = requestAnimationFrame(draw);
      }
    })();

    return () => cancelAnimationFrame(handle);
  }, [run, speed, freq]);

  return (
    <div ref={containerRef}>
      <div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      </div>
    </div>
  );
};

export function NoiseExample() {
  return (
    // <Canvas />
    <Example summary="Example">{(open) => (open ? <Canvas /> : null)}</Example>
  );
}
