import van from "./van-1.2.3.min";
import { Noise, lerp } from "../src";

const { button, input, label, div, canvas } = van.tags;

export default function Noises() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const DEFAULT_FREQ = 5;

  const c = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = c.getContext("2d")!;
  const d = ctx.createImageData(WIDTH, HEIGHT);
  const p = new Noise.Perlin();
  const p2 = new Noise.Simplex();

  const run = van.state(false);
  const freq = van.state(DEFAULT_FREQ);
  let t = 0;
  let raf: number;
  let fn: () => void = basic;

  function basic() {
    p.fill(d, {
      freq: freq.val,
      z: t,
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run.val) {
      raf = requestAnimationFrame(basic);
    }
  }

  const s = ctx.createImageData(WIDTH, HEIGHT);
  p2.fill(s, { freq: 500 });
  function layers1() {
    p.fill(d, {
      freq: freq.val,
      z: t,
      set: ({ x, y, v }) => {
        const cell = (x + y * d.width) * 4;
        const n2 = lerp(0, 64, s.data[cell] / 256);
        d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = v + n2;
        d.data[cell + 3] = 255; // alpha
      },
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run.val) {
      raf = requestAnimationFrame(layers1);
    }
  }

  function layers2() {
    p.fill(d, {
      freq: freq.val,
      z: t,
      set: ({ x, y, z, v }) => {
        const n2 = lerp(0, 64, (p2.xyz(x / 20, y / 20, z) + 1) / 2);
        const cell = (x + y * d.width) * 4;
        d.data[cell] = d.data[cell + 1] = d.data[cell + 2] = v + n2;
        d.data[cell + 3] = 255; // alpha
      },
    });
    ctx.putImageData(d, 0, 0);
    t += 0.01;
    if (run.val) {
      raf = requestAnimationFrame(layers2);
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
          defaultChecked: false,
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
            cancelAnimationFrame(raf);
            fn = basic;
            fn();
          },
        },
        "xyz"
      ),
      button(
        {
          onclick: () => {
            cancelAnimationFrame(raf);
            fn = layers1;
            fn();
          },
        },
        "xy + xyz"
      ),
      button(
        {
          onclick: () => {
            cancelAnimationFrame(raf);
            fn = layers2;
            fn();
          },
        },
        "xyz + xyz"
      )
    )
  );
}
