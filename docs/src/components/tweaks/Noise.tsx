import * as React from "react";
import { useTweaks } from "use-tweaks";
import { Noise, NoiseGenerator, uncheckedLerp } from "../../../../src";

const WIDTH = 800;
const HEIGHT = 600;
const DEFAULT_FREQ = 5;

export function NoiseTweaks() {
  const [run, setRun] = React.useState(true);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  let { current: ctx } = React.useRef<CanvasRenderingContext2D>(null);
  let { current: d } = React.useRef<ImageData>(null);
  let { current: t } = React.useRef(0);
  let { current: g1 } = React.useRef<NoiseGenerator>(new Noise.Perlin());
  let { current: g2 } = React.useRef<NoiseGenerator>(new Noise.Perlin());

  const { freq, ...config } = useTweaks(
    {
      freq: { value: DEFAULT_FREQ, min: 1, max: 100, step: 1 },
      mass: { value: 1, min: 1, max: 10 },
      tension: { value: 170, min: 1, max: 200 },
      friction: { value: 26, min: 1, max: 30 },
    },
    { container: containerRef }
  );

  console.log({ freq });

  const perlin = React.useCallback(() => {
    g1.fill(d, {
      freq,
      z: t,
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run) {
      requestAnimationFrame(perlin);
    }
  }, [freq]);

  React.useEffect(() => {
    if (!canvasRef) return;
    ctx = canvasRef.current.getContext("2d")!;
    d = ctx.createImageData(WIDTH, HEIGHT);
    perlin();
  }, [freq]);

  return (
    <div ref={containerRef}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
