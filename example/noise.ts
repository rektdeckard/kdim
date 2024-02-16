import van from "./vendor/van-1.2.3.min";
import { Noise, NoiseGenerator, uncheckedLerp } from "../src";

const { button, input, label, div, canvas } = van.tags;

function grayscaleToRGB(v: number): { r: number; g: number; b: number } {
  // v: [0, 255]
  // red: 0 -> 255, 0, 0
  // yellow: 51
  // green: 102
  // cyan: 153
  // blue: 204
  // magenta: 255
  const r = 255 - v;
  const g = Math.abs(64 - v) * 4;
  const b = Math.abs(128 - v) * 4;
  return { r, g, b };
}

function fillGrayscale(data: Uint8ClampedArray, cell: number, v: number) {
  data[cell] = data[cell + 1] = data[cell + 2] = v;
  data[cell + 3] = 255;
}

function fillRBG(data: Uint8ClampedArray, cell: number, v: number) {
  const { r, g, b } = grayscaleToRGB(v);
  data[cell] = g;
  data[cell + 1] = b;
  data[cell + 2] = r;
  data[cell + 3] = 255;
}

export default function Noises() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const DEFAULT_FREQ = 5;

  const c = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = c.getContext("2d")!;
  const d = ctx.createImageData(WIDTH, HEIGHT);
  let g1: NoiseGenerator = new Noise.Perlin().seed(1);
  let g2: NoiseGenerator = new Noise.Perlin().seed(1);

  const run = van.state(false);
  const color = van.state(false);
  const speed = van.state(0.01);
  const freq = van.state(DEFAULT_FREQ);
  let t = 0;
  let raf: number;
  let fn: () => void = perlin;

  function perlin() {
    g1.fill(d, {
      freq: freq.val,
      z: t,
      set: color.val
        ? ({ x, y, v }) => {
            const cell = (x + y * d.width) * 4;
            fillRBG(d.data, cell, v);
          }
        : undefined,
    });
    ctx.putImageData(d, 0, 0);
    t += speed.val;
    if (run.val) {
      raf = requestAnimationFrame(perlin);
    }
  }

  const s = ctx.createImageData(WIDTH, HEIGHT);
  g2.fill(s, { freq: 400 });
  function perlinAndStatic() {
    g1.fill(d, {
      freq: freq.val,
      z: t,
      set: !color.val
        ? ({ x, y, v }) => {
            const cell = (x + y * d.width) * 4;
            const value = v * 0.75 + s.data[cell] / 4;
            fillGrayscale(d.data, cell, value);
          }
        : ({ x, y, v }) => {
            const cell = (x + y * d.width) * 4;
            const value = v * 0.75 + s.data[cell] / 4;
            fillRBG(d.data, cell, value);
          },
    });
    ctx.putImageData(d, 0, 0);
    t += speed.val;
    if (run.val) {
      raf = requestAnimationFrame(perlinAndStatic);
    }
  }

  function perlinFractal() {
    g1.fill(d, {
      freq: freq.val,
      z: t,
      set: !color.val
        ? ({ x, y, z, v }) => {
            const n2 = uncheckedLerp(
              0,
              64,
              (g2.xyz(x / 20, y / 20, z) + 1) / 2
            );
            const cell = (x + y * d.width) * 4;
            const value = v * 0.75 + n2;
            fillGrayscale(d.data, cell, value);
          }
        : ({ x, y, z, v }) => {
            const n2 = uncheckedLerp(
              0,
              64,
              (g2.xyz(x / 20, y / 20, z) + 1) / 2
            );
            const cell = (x + y * d.width) * 4;
            const value = v * 0.75 + n2;
            fillRBG(d.data, cell, value);
          },
    });
    ctx.putImageData(d, 0, 0);
    t += speed.val;
    if (run.val) {
      raf = requestAnimationFrame(perlinFractal);
    }
  }

  function perlinFractalDyn() {
    const fill = color.val ? fillRBG : fillGrayscale;
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        const sx = x / (HEIGHT / freq.val);
        const sy = y / (HEIGHT / freq.val);
        const v1 = uncheckedLerp(0, 196, (g1.xyz(sx, sy, t) + 1) / 2);
        const v2 = uncheckedLerp(
          0,
          64,
          (g1.xyz(sx * 10, sy * 10, t * 10) + 1) / 2
        );
        const cell = (x + y * WIDTH) * 4;
        fill(d.data, cell, v1 + v2);
      }
    }
    ctx.putImageData(d, 0, 0);
    t += speed.val;
    if (run.val) {
      raf = requestAnimationFrame(perlinFractalDyn);
    }
  }

  function whiteNoise() {
    g1.fill(d, {
      set: ({ x, y }) => {
        const cell = (x + y * d.width) * 4;
        d.data[cell + 3] = 255;
      },
    });
    ctx.putImageData(d, 0, 0);
    if (run.val) {
      raf = requestAnimationFrame(whiteNoise);
    }
  }

  function whiteNoiseColor() {
    g1.fill(d, {
      set: ({ x, y, v }) => {
        const cell = (x + y * d.width) * 4;
        const bw = v > 127 ? 255 : 0;
        d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = bw;
        d.data[cell + 3] = 255;
      },
    });
    ctx.putImageData(d, 0, 0);
    if (run.val) {
      raf = requestAnimationFrame(whiteNoiseColor);
    }
  }

  let sign = 1;
  function worleyNoise() {
    const fill = color.val ? fillRBG : fillGrayscale;
    g1.fill(d, {
      z: t,
      freq: freq.val,
      set: ({ x, y, v }) => {
        const cell = (x + y * d.width) * 4;
        fill(d.data, cell, v);
      },
    });
    ctx.putImageData(d, 0, 0);
    t += speed.val * sign;
    if (t > 1 || t < 0) {
      t = t > 1 ? 1 : 0;
      sign *= -1;
    }
    if (run.val) {
      raf = requestAnimationFrame(worleyNoise);
    }
  }

  fn();

  return div(
    { style: "overflow-x: hidden;" },
    div(
      { class: "iflexy" },
      div(
        { class: "flexy" },
        button(
          {
            onclick: () => {
              g1 = new Noise.Perlin().seed(1);
              cancelAnimationFrame(raf);
              fn = perlin;
              fn();
            },
          },
          "Perlin"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Perlin().seed(1);
              g2 = new Noise.Simplex().seed(1);
              cancelAnimationFrame(raf);
              fn = perlinAndStatic;
              fn();
            },
          },
          "Perlin + Static Simplex"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Perlin().seed(1);
              g2 = new Noise.Perlin().seed(1);
              cancelAnimationFrame(raf);
              fn = perlinFractal;
              fn();
            },
          },
          "Perlin Static Fractal"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Perlin().seed(1);
              g2 = new Noise.Perlin().seed(1);
              cancelAnimationFrame(raf);
              fn = perlinFractalDyn;
              fn();
            },
          },
          "Perlin Fractal Dynamic"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Color().seed(1);
              cancelAnimationFrame(raf);
              fn = whiteNoise;
              fn();
            },
          },
          "White"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Color().seed(1);
              cancelAnimationFrame(raf);
              fn = whiteNoiseColor;
              fn();
            },
          },
          "White (normalized)"
        ),
        button(
          {
            onclick: () => {
              g1 = new Noise.Worley(null, freq.val);
              cancelAnimationFrame(raf);
              fn = worleyNoise;
              fn();
            },
          },
          "Worley"
        )
      ),
      c,
      div(
        { class: "flexy" },
        label(
          "Run",
          input({
            type: "checkbox",
            defaultChecked: run.val,
            onchange: (e) => {
              cancelAnimationFrame(raf);
              const checked = e.target.checked;
              run.val = checked;
              fn();
            },
          })
        ),
        label(
          "Speed",
          input({
            type: "range",
            defaultValue: speed.val,
            min: 0.005,
            max: 0.1,
            step: 0.005,
            oninput: (e) => {
              cancelAnimationFrame(raf);
              speed.val = e.target.valueAsNumber;
              fn();
            },
          })
        ),
        label(
          "Freq",
          input({
            type: "range",
            min: 1,
            max: 100,
            defaultValue: DEFAULT_FREQ,
            oninput: (e) => {
              cancelAnimationFrame(raf);
              freq.val = e.target.valueAsNumber;
              fn();
            },
          })
        ),
        label(
          "Color",
          input({
            type: "checkbox",
            defaultChecked: color.val,
            onchange: (e) => {
              cancelAnimationFrame(raf);
              const checked = e.target.checked;
              color.val = checked;
              fn();
            },
          })
        )
      )
    )
  );
}
