import van from "./vendor/van-1.2.3.min";
import { Pane } from "tweakpane";

import { INTERPOLATORS } from "./color";
import { SideBy, Example } from "./components";
import { docs } from "./links";
import { saveVideo } from "./util.ts";
import { Complex } from "../src";

const ENABLE_CAPTURE = false;
const ENABLE_QUICK_PAN_ZOOM = true;
const QUICK_PAN_ZOOM_DEBOUNCE = 200;

const { canvas, code, p, i, h2, h3 } = van.tags;
const { math, msup, msub, mrow, mtable, mo, mi, mn, mtr, mtd, mtext } = van.tagsNS(
  "http://www.w3.org/1998/Math/MathML"
);

export default function() {
  const mandelbrot_test_point = new Complex(0.5, -0.5);
  const mandelbrot_limit = escapesIn(mandelbrot_test_point);

  function escapesIn(c: Complex) {
    let z = Complex.from(c);
    let p = Complex.from(z);
    for (let x = 0; x < 100; x++) {
      p = Complex.from(z);
      z = z.pow(2).add(c);
      const d = Math.sqrt(z.real ** 2 + z.imaginary ** 2);
      if (d > 2) {
        return { i: x, d, z, p };
      }
    }
    return { i: 100, d: Infinity, z, p };
  }

  return SideBy(
    {
      left: [
        h2("Fractals and complex arithmetic"),
        p(
          "Using the ", docs.complex(code("Complex")), " numeric class, we can generate a visualization of interesting sets like the Julia and Mandelbrot fractals. In general, the Mandelbrot set is defined as the set of values ",
          math(mi("c")),
          " in the complex plane for which repeated application of a complex polynomical function such as the following remains bounded:",
        ),
        math(
          { display: "block" },
          mrow(
            msub(mi("z"), mrow(mi("n"), mo("+"), mn(1))),
            mo("="),
            msup(msub(mi("z"), mi("n")), mn(2)),
            mo("+"),
            mi("c"),
          ),
        ),
        p("For a given point, starting at ", math(msub(mi("z"), mn(0)), mo("="), mn(0)), ", iterations will either diverge to infinity or form a cycle where its value is always ", math(mo("≤"), mn(2)), " from the origin. For certain values of interest, the ", i("rate at which it diverges"), " is slow, and the number of iterations required froms the patterns we are familiar with. Let's say we start with a point ", math(mo("("), mn(mandelbrot_test_point.real), mo(","), mn(mandelbrot_test_point.imaginary), mo(")")), "."),
        math(
          { display: "block" },
          mtable(
            mtr(
              mtd({ class: "al" }, msub(mi("z"), mn(0)), mo("="), mn(0)),
              mtd({ class: "al" }, mrow(mo("|"), msub(mi("z"), mn(0)), mo("|")), mo("="), mn(0))),
            mtr(
              mtd({ class: "al" },
                msub(mi("z"), mn(1)), mo("="), msup(mn(0), mn(2)), mo("+"),
                mo("("), ComplexObject({ complex: mandelbrot_test_point }), mo(")")),
              mtd({ class: "al" }, mrow(mo("|"), msub(mi("z"), mn(1)), mo("|")), mo("="), mn(Math.sqrt(mandelbrot_test_point.real ** 2 + mandelbrot_test_point.imaginary ** 2).toFixed(3)))
            ),
            mtr(mtd({ class: "al" }, mtext("...")), mtd({ class: "al" }, mtext("..."))),
            mtr(
              mtd(
                { class: "al" },
                msub(mi("z"), mn(mandelbrot_limit.i + 1)), mo("="), msup(mrow(mo("("), ComplexObject({ complex: mandelbrot_limit.p }), mo(")")), mn(2)), mo("+"), mo("("), ComplexObject({ complex: mandelbrot_test_point }), mo(")"),
              ),
              mtd({ class: "al" }, mrow(mo("|"), msub(mi("z"), mn(mandelbrot_limit.i + 1)), mo("|")), mo("="), mn(mandelbrot_limit.d.toFixed(3))),
            ),
          )
        ),
        p(
          "After 4 applications of the function, the result (or rather, its absolute value) exceeds 2 and therefore can be proven to grow to infinity. If we choose a color scale to represent the rate of divergence, and color the remaining (bounded) points black, we receive an image of the Mandelbrot set."
        ),
      ],
    },
    Fractal()
  );
}

function Fractal() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const MAIN_AXIS = Math.max(WIDTH, HEIGHT);
  const ZOOM_SCALE = 1.1;
  const DEFAULT_PARAMS = {
    iterations: 100,
    stride: 2,
    zoom: 1.0,
    offset: { x: 0, y: 0 },
    exponent: 2,
    julia_c: { x: -0.5251993, y: -0.5251993 },
    modulus: 2,
    scale: "Purples",
    invert: false,
    smooth: false,
  };
  const PARAMS = { ...DEFAULT_PARAMS };

  const PAN_STRIDE = 5;
  let panning = false;
  let zooming = false;
  let zoom_timeout: NodeJS.Timeout | null = null;
  let temp_stride = -1;

  function pushTempStride() {
    temp_stride = PARAMS.stride;
    PARAMS.stride = Math.max(PARAMS.stride, PAN_STRIDE);
  }

  function restoreStride() {
    if (panning || zooming) {
      PARAMS.stride = temp_stride;
      panning = false;
      zooming = false;
      pane.refresh();
      draw();
    }
    zoom_timeout = null;
  }

  let canv: HTMLCanvasElement | OffscreenCanvas = canvas({
    width: WIDTH,
    height: HEIGHT,
    class: "grabbable",
    onwheel: (e: WheelEvent) => {
      e.preventDefault();
      if (ENABLE_QUICK_PAN_ZOOM) {
        if (zoom_timeout === null) {
          pushTempStride();
        } else {
          clearTimeout(zoom_timeout);
        }
        zoom_timeout = setTimeout(() => restoreStride(), QUICK_PAN_ZOOM_DEBOUNCE);
        zooming = true;
      }

      const { x, y } = PARAMS.offset;
      if (e.deltaY < 0) {
        PARAMS.zoom *= ZOOM_SCALE;
        PARAMS.offset = { x: x * ZOOM_SCALE, y: y * ZOOM_SCALE };
      } else {
        PARAMS.zoom /= ZOOM_SCALE;
        PARAMS.offset = { x: x / ZOOM_SCALE, y: y / ZOOM_SCALE };
      }
      pane.refresh();
      draw();
    },
    onpointermove: (e: MouseEvent) => {
      if (e.buttons !== 1) return;
      if (ENABLE_QUICK_PAN_ZOOM) {
        if (zoom_timeout === null) {
          pushTempStride();
        } else {
          clearTimeout(zoom_timeout);
        }
        zoom_timeout = setTimeout(() => restoreStride(), QUICK_PAN_ZOOM_DEBOUNCE);
        panning = true;
      }

      const { x, y } = PARAMS.offset;
      PARAMS.offset = { x: x - e.movementX, y: y - e.movementY };
      pane.refresh();
      draw();
    },
    // onpointerup: ENABLE_QUICK_PAN_ZOOM ? restoreStride : null,
    // onpointerout: ENABLE_QUICK_PAN_ZOOM ? restoreStride : null,

    oncontextmenu: (e: MouseEvent) => {
      e.preventDefault();
      console.info({
        offset: PARAMS.offset,
        zoom: PARAMS.zoom,
        stride: PARAMS.stride,
        iterations: PARAMS.iterations,
        exponent: PARAMS.exponent,
        c: PARAMS.julia_c,
      });
    },
  });
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D = canv.getContext("2d")!;

  const pane = new Pane({ title: "Parameters" });
  const tab = pane.addTab({
    pages: [
      { title: "Julia" },
      { title: "Mandelbrot" },
      { title: "Cactus" },
      { title: "Ship" },
      { title: "Moire" },
    ],
  });
  tab.pages[0].addBinding(PARAMS, "julia_c", {
    label: "point",
    x: { min: -2, max: 2 },
    y: { min: -2, max: 2 },
  }).on("change", draw);
  tab.pages[1].addBinding(PARAMS, "exponent", {
    label: "exponent",
    min: 2,
    max: 10,
    step: 1,
  }).on("change", draw);
  tab.pages[2].addBinding(PARAMS, "exponent", {
    label: "exponent",
    min: 2,
    max: 10,
    step: 1,
  }).on("change", draw);
  tab.pages[3].addBinding(PARAMS, "exponent", {
    label: "exponent",
    min: 2,
    max: 10,
    step: 1,
  }).on("change", draw);
  tab.pages[4].addBinding(PARAMS, "modulus", {
    label: "modulus",
    min: 1,
    max: 4,
    step: 1,
  }).on("change", draw);
  tab.on("select", () => {
    pane.refresh();
    draw();
  });
  pane.addBlade({ view: "separator" });
  pane.addBinding(PARAMS, "iterations", {
    min: 1,
    max: 1000,
    step: 1,
    format: (v) => v.toFixed(0),
  }).on("change", draw);
  pane.addBinding(PARAMS, "stride", {
    min: 1,
    max: 100,
    step: 1,
    format: (v) => v.toFixed(0),
  }).on("change", draw);
  pane.addBinding(PARAMS, "scale", {
    options: Object.keys(INTERPOLATORS).reduce(
      (acc, key) => ({ ...acc, [key]: key }),
      {}
    ),
  }).on("change", draw);
  pane.addBinding(PARAMS, "invert").on("change", draw);
  // pane.addBinding(PARAMS, "smooth").on("change", (e) => {
  //   if (canv instanceof OffscreenCanvas) {
  //   } else {
  //     canv.classList[e.value ? "add" : "remove"]("smooth");
  //     draw();
  //   }
  // });
  pane.addBlade({ view: "separator" });
  pane.addButton({ title: "Reset" }).on("click", reset);

  if (ENABLE_CAPTURE) {
    pane.addButton({ title: "Record" }).on("click", () => {
      // {
      //   PARAMS.iterations = 100;
      //   PARAMS.stride = 1;
      //   PARAMS.offset = { x: 50.409192162008836, y: 105.67976979153667 };
      //   PARAMS.zoom = 0.9999999999999998;
      // }

      // {
      //   PARAMS.iterations = 100;
      //   PARAMS.stride = 1;
      //   PARAMS.offset = {x: 28.699800134325493, y: 13.235219706141537};
      //   PARAMS.zoom = 0.1288396211340385;
      //   PARAMS.julia_c = { x: -0.1838235, y: -0.6681985 };
      // }

      // {
      //   tab.pages[1].selected = true;
      //   tab.pages[0].selected = false;
      //   PARAMS.iterations = 100;
      //   PARAMS.stride = 1;
      //   PARAMS.offset = { x: -19.754255103824594, y: 22.3536824833637 };
      //   PARAMS.zoom = 0.18129028535257674;
      //   PARAMS.exponent = 2;
      //   PARAMS.scale = "Spectral";
      //   PARAMS.invert = true;
      // }

      // {
      //   tab.pages[0].selected = true;
      //   tab.pages[1].selected = false;
      //   PARAMS.iterations = 100;
      //   PARAMS.stride = 1;
      //   PARAMS.offset = { x: -3.1557671462338437, y: 0.45462455886752356 };
      //   PARAMS.zoom = 0.04624599826929624;
      //   PARAMS.scale = "RdYlBu";
      //   PARAMS.invert = true;
      //   PARAMS.julia_c = { x: -0.22058823529411764, y: -0.7270220588235294 };
      // }

      {
        tab.pages[0].selected = true;
        tab.pages[1].selected = false;
        PARAMS.iterations = 200;
        PARAMS.stride = 1;
        PARAMS.offset = { x: -0.08185745207194693, y: 0.02633283452359185 };
        PARAMS.zoom = 0.002475803738526237;
        PARAMS.scale = "Earthen";
        PARAMS.invert = true;
        PARAMS.julia_c = { x: -0.20588235294117652, y: 0.8318014705882353 };
      }


      draw();

      canv = new OffscreenCanvas(WIDTH, HEIGHT);
      ctx = canv.getContext("2d")!;
      saveVideo(canv, () => {
        draw();
        const { x, y } = PARAMS.offset;
        PARAMS.zoom *= ZOOM_SCALE;
        PARAMS.offset = { x: x * ZOOM_SCALE, y: y * ZOOM_SCALE };
      }, undefined, { fps: 30, count: 600, quality: 1 });
    });
  }

  function mandelbrot(iterations: number, scale: number, exponent: number) {
    return function(x: number, y: number) {
      const c = new Complex(
        (x / MAIN_AXIS) * scale - scale / 2,
        (y / MAIN_AXIS) * scale - scale / 2
      );
      let z = Complex.from(c);

      for (let i = 0; i < iterations; i++) {
        z = z.pow(exponent).add(c);
        if (z.abs() > 2) {
          return i;
        }
      }
      return iterations;
    }
  }

  function julia(iterations: number, scale: number, c: Complex) {
    return function(x: number, y: number) {
      let z = new Complex(
        (x / MAIN_AXIS) * scale - scale / 2,
        (y / MAIN_AXIS) * scale - scale / 2
      );

      for (let i = 0; i < PARAMS.iterations; i++) {
        z = z.pow(2).add(c);
        if (z.abs() > 2) {
          return i;
        }
      }
      return iterations;
    }
  }

  function cactus(iterations: number, scale: number, exponent: number) {
    return function(x: number, y: number) {
      const c = new Complex(
        (x / MAIN_AXIS) * scale - scale / 2,
        (y / MAIN_AXIS) * scale - scale / 2
      );
      let z = Complex.from(c);

      for (let i = 0; i < iterations; i++) {
        z = z.pow(exponent).add(c.sub(1).mul(z)).sub(c);
        if (z.abs() > 2) {
          return i;
        }
      }
      return iterations;
    }
  }

  function moire(iterations: number, scale: number, modulus: number) {
    return function(x: number, y: number) {
      const c = new Complex(
        (x / MAIN_AXIS) * scale - scale / 2,
        (y / MAIN_AXIS) * scale - scale / 2
      );
      let z = Complex.from(c);

      for (let i = 0; i < iterations; i++) {
        const a = z.pow(2);
        z = new Complex(a.real % modulus, a.imaginary % modulus);
        if (z.abs() > 2) {
          return i;
        }
      }
      return iterations;
    }
  }

  function ship(iterations: number, scale: number, exponent: number) {
    return function(x: number, y: number) {
      const c = new Complex(
        (x / MAIN_AXIS) * scale - scale / 2,
        (y / MAIN_AXIS) * scale - scale / 2
      );
      let z = Complex.from(c);

      for (let i = 0; i < iterations; i++) {
        const a = new Complex(Math.abs(z.real), Math.abs(z.imaginary));
        z = a.pow(exponent).add(c);
        if (z.abs() > 2) {
          return i;
        }
      }
      return iterations;
    }
  }

  function draw() {
    const { x: offsetX, y: offsetY } = PARAMS.offset;
    const interpolate = INTERPOLATORS[PARAMS.scale];
    const scale = 4 / PARAMS.zoom;
    const algo = tab.pages[0].selected
      ? julia(PARAMS.iterations, scale, new Complex(PARAMS.julia_c.x, PARAMS.julia_c.y))
      : tab.pages[1].selected ? mandelbrot(PARAMS.iterations, scale, PARAMS.exponent)
        : tab.pages[2].selected ? cactus(PARAMS.iterations, scale, PARAMS.exponent)
          : tab.pages[3].selected ? ship(PARAMS.iterations, scale, PARAMS.exponent)
            : moire(PARAMS.iterations, scale, PARAMS.modulus);

    let i: number;
    for (let y = 0; y < HEIGHT; y += PARAMS.stride) {
      for (let x = 0; x < WIDTH; x += PARAMS.stride) {
        i = algo(
          x + offsetX + PARAMS.stride / 2,
          y + offsetY + PARAMS.stride / 2
        );

        if (i === PARAMS.iterations) {
          ctx.fillStyle = "black";
        } else {
          const value = PARAMS.invert
            ? 1 - i / PARAMS.iterations
            : i / PARAMS.iterations;
          const { r, g, b } = interpolate(value);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        }
        ctx.fillRect(x, y, PARAMS.stride, PARAMS.stride);
      }
    }
  }

  function reset() {
    Object.assign(PARAMS, DEFAULT_PARAMS);
    pane.refresh();
    draw();
  }

  draw();
  return Example(canv, pane.element);
}

function ComplexObject({ complex }: { complex: Complex }) {
  const { real, imaginary } = complex;
  const els: Element[] = [];

  if (!!real || !imaginary) {
    if (real < 0) els.push(mo("−"));
    els.push(mn(Math.abs(real)));
  }

  if (!!imaginary) {
    if (imaginary < 0) {
      els.push(mo("−"));
    } else if (real) {
      els.push(mo("+"));
    }
    els.push(mn(Math.abs(imaginary)), mi("i"));
  }

  return els;
}

