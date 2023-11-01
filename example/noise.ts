import van from "./vendor/van-1.2.3.min";
import { Noise, NoiseGenerator, uncheckedLerp } from "../src";

const { button, input, label, div, canvas } = van.tags;

export default function Noises() {
  const WIDTH = 800;
  const HEIGHT = 600;
  const DEFAULT_FREQ = 5;

  const c = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = c.getContext("2d")!;
  const d = ctx.createImageData(WIDTH, HEIGHT);
  let g1: NoiseGenerator = new Noise.Perlin(1);
  let g2: NoiseGenerator = new Noise.Perlin(1);

  const run = van.state(false);
  const freq = van.state(DEFAULT_FREQ);
  let t = 0;
  let raf: number;
  let fn: () => void = perlin;

  function perlin() {
    g1.fill(d, {
      freq: freq.val,
      z: t,
      // set: ({ x, y, v }) => {
      //   const cell = (x + y * d.width) * 4;
      //   d.data[cell] = v ** 2 / -64 + 256;
      //   d.data[cell + 1] = v ** 2 / -64 + 2 * v + 192;
      //   d.data[cell + 2] = v ** 2 / -64 + 4 * v;
      //   d.data[cell + 3] = 255; // alpha
      // },
      // set: ({ x, y, v }) => {
      //   const cell = (x + y * d.width) * 4;
      //   d.data[cell] = -2 * v + 255;
      //   d.data[cell + 1] = 255 - Math.abs(255 -2 * v) * 2;
      //   d.data[cell + 2] = 2 * v - 255;
      //   d.data[cell + 3] = 255; // alpha
      // },
      // set: ({ x, y, v }) => {
      //   const cell = (x + y * d.width) * 4;
      //   d.data[cell] = -2 * v + 255;
      //   d.data[cell + 1] = 255 - Math.abs(v - 128) * 2;
      //   d.data[cell + 2] = 2 * v - 255;
      //   d.data[cell + 3] = 255; // alpha
      // },
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
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
      set: ({ x, y, v }) => {
        const cell = (x + y * d.width) * 4;
        d.data[cell] =
          d.data[cell + 1] =
          d.data[cell + 2] =
            v * 0.75 + s.data[cell] / 4;
        d.data[cell + 3] = 255; // alpha
      },
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run.val) {
      raf = requestAnimationFrame(perlinAndStatic);
    }
  }

  function perlinFractal() {
    g1.fill(d, {
      freq: freq.val,
      z: t,
      set: ({ x, y, z, v }) => {
        const n2 = uncheckedLerp(0, 64, (g2.xyz(x / 20, y / 20, z) + 1) / 2);
        const cell = (x + y * d.width) * 4;
        d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = v * 0.75 + n2;
        d.data[cell + 3] = 255; // alpha
      },
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run.val) {
      raf = requestAnimationFrame(perlinFractal);
    }
  }

  function perlinFractalDyn() {
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
        d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = v1 + v2;
        d.data[cell + 3] = 255; // alpha
      }
    }
    ctx.putImageData(d, 0, 0);
    t += 0.01;
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

  fn();

  return div(
    { style: "overflow-x: hidden;" },
    c,
    div(
      { class: "iflexy" },
      label(
        "Run",
        input({
          type: "checkbox",
          defaultChecked: run.val,
          onchange: (e) => {
            const checked = e.target.checked;
            run.val = checked;
            if (checked) {
              fn();
            }
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
            freq.val = e.target.valueAsNumber;
            if (!run.val) {
              fn();
            }
          },
        })
      ),
      button(
        {
          onclick: () => {
            g1 = new Noise.Perlin(1);
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
            g1 = new Noise.Perlin(1);
            g2 = new Noise.Simplex(1);
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
            g1 = new Noise.Perlin(1);
            g2 = new Noise.Perlin(1);
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
            g1 = new Noise.Perlin(1);
            g2 = new Noise.Perlin(1);
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
            g1 = new Noise.Color(1);
            cancelAnimationFrame(raf);
            fn = whiteNoise;
            fn();
          },
        },
        "Color"
      ),
      button(
        {
          onclick: () => {
            g1 = new Noise.Color(1);
            cancelAnimationFrame(raf);
            fn = whiteNoiseColor;
            fn();
          },
        },
        "Color  (normalized)"
      )
    )
  );
}
