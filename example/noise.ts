import van from "./vendor/van-1.2.3.min";
import { Pane } from "tweakpane";
import * as Essentials from "@tweakpane/plugin-essentials";

import { SideBy, Example } from "./components";
import { INTERPOLATORS, Interpolator } from "./color";
import { Noise, NoiseGenerator, uncheckedLerp } from "../src";

const { p, h2, h3, canvas } = van.tags;

export default function() {
  return SideBy(
    {
      left: [
        h2("Noise generation"),
        p(
          "Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Augue interdum velit euismod in pellentesque massa placerat duis. Donec ultrices tincidunt arcu non. Id aliquet lectus proin nibh nisl condimentum id. Volutpat consequat mauris nunc congue nisi vitae. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Quis viverra nibh cras pulvinar mattis nunc sed. Elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi. Vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare massa. Morbi non arcu risus quis varius quam quisque."
        ),
        h3("Grommet hole"),
        p(
          "Vulputate enim nulla aliquet porttitor lacus. Vestibulum lectus mauris ultrices eros in. Faucibus vitae aliquet nec ullamcorper sit amet. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Egestas pretium aenean pharetra magna. In iaculis nunc sed augue lacus viverra vitae congue eu. Felis imperdiet proin fermentum leo. Eu feugiat pretium nibh ipsum. Leo integer malesuada nunc vel risus. Sit amet mauris commodo quis imperdiet. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Et egestas quis ipsum suspendisse. Amet justo donec enim diam vulputate ut pharetra sit amet. Tempor id eu nisl nunc mi ipsum faucibus. Dolor purus non enim praesent elementum facilisis leo vel. Sit amet massa vitae tortor condimentum lacinia quis vel eros. Porttitor rhoncus dolor purus non enim praesent elementum facilisis. Sed velit dignissim sodales ut eu sem integer vitae."
        ),
      ],
    },
    Noises()
  );
}

function fillUsing(
  interpolator: Interpolator,
  data: Uint8ClampedArray,
  cell: number,
  v: number,
  invert: boolean = false
) {
  const value = invert ? 1 - v / 255 : v / 255;
  const { r, g, b } = interpolator(value);
  data[cell] = r;
  data[cell + 1] = g;
  data[cell + 2] = b;
  data[cell + 3] = 255;
}

function Noises() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const PRESETS = {
    Perlin: () => basic(new Noise.Perlin().seed(1)),
    Simplex: () => basic(new Noise.Simplex().seed(1)),
    "Static Fractal": perlinAndStatic,
    "Fixed Fractal": perlinFractal,
    "Dynamic Fractal": perlinFractalDyn,
    Worley: worleyNoise,
    White: whiteNoiseColor,
    "White (normalized)": whiteNoise,
    Custom: customRender,
  } as const;
  const DEFAULT_PARAMS = {
    scale: "Purples",
    invert: false,
    freq: 5,
    speed: 0.01,
    run: false,
    noise: "Perlin",
  };
  const PARAMS = { ...DEFAULT_PARAMS };

  const canv = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = canv.getContext("2d")!;
  const d = ctx.createImageData(WIDTH, HEIGHT);
  let g1: NoiseGenerator = new Noise.Perlin().seed(1);
  let g2: NoiseGenerator = new Noise.Perlin().seed(1);

  let sign = 1;
  let t = 0;
  let raf: number;
  let fn: () => void = () => basic(new Noise.Perlin().seed(1));

  function basic(g: NoiseGenerator) {
    g1 = g;
    cancelAnimationFrame(raf);
    fn = draw;

    function draw() {
      g1.fill(d, {
        freq: PARAMS.freq,
        z: t,
        set: ({ x, y, v }) => {
          const cell = (x + y * d.width) * 4;
          fillUsing(
            INTERPOLATORS[PARAMS.scale],
            d.data,
            cell,
            v,
            PARAMS.invert
          );
        },
      });
      ctx.putImageData(d, 0, 0);
      t += PARAMS.speed;
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function customRender() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Simplex();

    function draw() {
      if (PARAMS.scale !== "Greys") {
        // const [dark, light] = [
        //   INTERPOLATORS[PARAMS.scale](0),
        //   INTERPOLATORS[PARAMS.scale](1.0),
        // ];
        // console.log(
        //   `rgb(${Math.round(dark.r)} ${Math.round(dark.g)} ${Math.round(dark.b)})`,
        //   `rgb(${Math.round(light.r)} ${Math.round(light.g)} ${Math.round(light.b)})`
        // );
        // ctx.fillStyle = `rgb(${Math.round(dark.r)} ${Math.round(dark.g)} ${Math.round(dark.b)})`;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#96eda7";
        // ctx.fillStyle = `rgb(${Math.round(light.r)} ${Math.round(light.g)} ${Math.round(light.b)})`;
      } else {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "black";
      }

      for (let x = 0; x <= WIDTH; x += PARAMS.freq) {
        for (let y = 0; y <= HEIGHT; y += PARAMS.freq) {
          let v = g1.xyz(x / WIDTH, y / HEIGHT, t);
          v = ((v + 1) / 2) * PARAMS.freq;
          ctx.fillRect(x - v / 2, y - v / 2, v, v);
        }
      }

      t += PARAMS.speed;
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function perlinAndStatic() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Perlin().seed(1);
    g2 = new Noise.Simplex().seed(1);

    const s = ctx.createImageData(WIDTH, HEIGHT);
    g2.fill(s, { freq: 400 });

    function draw() {
      g1.fill(d, {
        freq: PARAMS.freq,
        z: t,
        set: ({ x, y, v }) => {
          const cell = (x + y * d.width) * 4;
          const value = v * 0.75 + s.data[cell] / 4;
          fillUsing(
            INTERPOLATORS[PARAMS.scale],
            d.data,
            cell,
            value,
            PARAMS.invert
          );
        },
      });
      ctx.putImageData(d, 0, 0);
      t += PARAMS.speed;
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function perlinFractal() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Perlin().seed(1);
    g2 = new Noise.Perlin().seed(1);

    function draw() {
      g1.fill(d, {
        freq: PARAMS.freq,
        z: t,
        set: ({ x, y, z, v }) => {
          const n2 = uncheckedLerp(0, 64, (g2.xyz(x / 20, y / 20, z) + 1) / 2);
          const cell = (x + y * d.width) * 4;
          const value = v * 0.75 + n2;
          fillUsing(
            INTERPOLATORS[PARAMS.scale],
            d.data,
            cell,
            value,
            PARAMS.invert
          );
        },
      });
      ctx.putImageData(d, 0, 0);
      t += PARAMS.speed;
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function perlinFractalDyn() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Perlin().seed(1);
    g2 = new Noise.Perlin().seed(1);

    function draw() {
      const interp = INTERPOLATORS[PARAMS.scale];

      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          const sx = x / (HEIGHT / PARAMS.freq);
          const sy = y / (HEIGHT / PARAMS.freq);
          const v1 = uncheckedLerp(0, 196, (g1.xyz(sx, sy, t) + 1) / 2);
          const v2 = uncheckedLerp(
            0,
            64,
            (g1.xyz(sx * 10, sy * 10, t * 10) + 1) / 2
          );
          const cell = (x + y * WIDTH) * 4;
          fillUsing(interp, d.data, cell, v1 + v2, PARAMS.invert);
        }
      }
      ctx.putImageData(d, 0, 0);
      t += PARAMS.speed;
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function whiteNoise() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Color().seed(1);

    function draw() {
      g1.fill(d, {
        set: ({ x, y }) => {
          const cell = (x + y * d.width) * 4;
          d.data[cell + 3] = 255;
        },
      });
      ctx.putImageData(d, 0, 0);
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  function whiteNoiseColor() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Color().seed(1);

    function draw() {
      g1.fill(d, {
        set: ({ x, y, v }) => {
          const cell = (x + y * d.width) * 4;
          const bw = v > 127 ? 255 : 0;
          d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = bw;
          d.data[cell + 3] = 255;
        },
      });
      ctx.putImageData(d, 0, 0);
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }

    draw();
  }

  function worleyNoise() {
    cancelAnimationFrame(raf);
    fn = draw;
    g1 = new Noise.Worley(null, PARAMS.freq);
    t = 0;
    sign = 1;

    function draw() {
      g1.fill(d, {
        z: t,
        freq: PARAMS.freq,
        set: ({ x, y, v }) => {
          const cell = (x + y * d.width) * 4;
          fillUsing(
            INTERPOLATORS[PARAMS.scale],
            d.data,
            cell,
            v * 2,
            PARAMS.invert
          );
        },
      });
      ctx.putImageData(d, 0, 0);
      t += PARAMS.speed * sign;
      if (t > 1.5 || t < -0.5) {
        t = t > 1.5 ? 1.5 : -0.5;
        sign *= -1;
      }
      if (PARAMS.run) {
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  const pane = new Pane({ title: "Parameters" });
  pane.registerPlugin(Essentials);
  pane
    .addBinding(PARAMS, "noise", {
      options: Object.keys(PRESETS).reduce(
        (acc, key) => ({ ...acc, [key]: key }),
        {}
      ),
    })
    .on("change", (e) => {
      PRESETS[e.value]();
    });

  pane
    .addBinding(PARAMS, "freq", { min: 1, max: 100, step: 1 })
    .on("change", () => {
      cancelAnimationFrame(raf);
      fn();
    });
  pane
    .addBinding(PARAMS, "speed", { min: 0.005, max: 0.1, step: 0.005 })
    .on("change", () => {
      cancelAnimationFrame(raf);
      fn();
    });

  pane
    .addBinding(PARAMS, "scale", {
      options: Object.keys(INTERPOLATORS).reduce(
        (acc, key) => ({ ...acc, [key]: key }),
        {}
      ),
    })
    .on("change", () => {
      cancelAnimationFrame(raf);
      fn();
    });
  pane.addBinding(PARAMS, "invert").on("change", () => {
    cancelAnimationFrame(raf);
    fn();
  });

  pane.addBlade({ view: "separator" });
  pane
    .addBlade({
      view: "buttongrid",
      size: [3, 1],
      cells: (x: number) => ({
        title: ["Start", "Tick", "Stop"][x],
      }),
    })
    .on("click", (ev) => {
      const idx = ev.index[0];
      switch (idx) {
        case 0:
          cancelAnimationFrame(raf);
          PARAMS.run = true;
          fn();
          break;
        case 1:
          if (PARAMS.run) return;
          fn();
          break;
        case 2:
          cancelAnimationFrame(raf);
          PARAMS.run = false;
          break;
      }
    });

  fn();
  return Example(canv, pane.element);
}
