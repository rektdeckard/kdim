import van from "./vendor/van-1.2.3.min";
import { Pane } from "tweakpane";

import { SideBy, Example } from "./components";
import { INTERPOLATORS } from "./color";
import { saveFrames, saveVideo } from "./util.ts";
import { Complex } from "../src";

const ENABLE_CAPTURE = true;

const { canvas, p, h2, h3 } = van.tags;
const { math, msup, mrow, mo, mi, mn } = van.tagsNS(
  "http://www.w3.org/1998/Math/MathML"
);

export default function() {
  const c1 = new Complex(5, -2);

  return SideBy(
    {
      left: [
        h2("Fractals and complex arithmetic"),
        p(
          "Vulputate enim nulla aliquet porttitor lacus. Vestibulum lectus mauris ultrices eros in. Faucibus vitae aliquet nec ullamcorper sit amet. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Egestas pretium aenean pharetra magna. In iaculis nunc sed augue lacus viverra vitae congue eu. Felis imperdiet proin fermentum leo. Eu feugiat pretium nibh ipsum. Leo integer malesuada nunc vel risus. Sit amet mauris commodo quis imperdiet. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Et egestas quis ipsum suspendisse. Amet justo donec enim diam vulputate ut pharetra sit amet. Tempor id eu nisl nunc mi ipsum faucibus. Dolor purus non enim praesent elementum facilisis leo vel. Sit amet massa vitae tortor condimentum lacinia quis vel eros. Porttitor rhoncus dolor purus non enim praesent elementum facilisis. Sed velit dignissim sodales ut eu sem integer vitae."
        ),
        h3("fsadsa"),
        math(
          { display: "block" },
          msup(mrow(mo("("), ComplexObject({ complex: c1 }), mo(")")), mn(2)),
          mo("="),
          ComplexObject({ complex: c1.pow(2) })
        ),
        p(
          "Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Augue interdum velit euismod in pellentesque massa placerat duis. Donec ultrices tincidunt arcu non. Id aliquet lectus proin nibh nisl condimentum id. Volutpat consequat mauris nunc congue nisi vitae. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Quis viverra nibh cras pulvinar mattis nunc sed. Elementum facilisis leo vel fringilla est ullamcorper eget nulla facilisi. Vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare massa. Morbi non arcu risus quis varius quam quisque."
        ),
      ],
    },
    Mandelbrot()
  );
}

function Mandelbrot() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const ZOOM_SCALE = 1.1;
  const DEFAULT_PARAMS = {
    iterations: 75,
    stride: 2,
    zoom: 1.0,
    offset: { x: 0, y: 0 },
    mandel_exponent: 2,
    julia_c: { x: -0.5251993, y: -0.5251993 },
    // julia_c: { x: -0.1911765, y: -0.6718750 },
    scale: "Purples",
    invert: false,
  };
  const PARAMS = { ...DEFAULT_PARAMS };

  const canv = canvas({
    width: WIDTH,
    height: HEIGHT,
    class: "grabbable",
    onmousewheel: (e: WheelEvent) => {
      e.preventDefault();
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
      const { x, y } = PARAMS.offset;
      PARAMS.offset = { x: x - e.movementX, y: y - e.movementY };
      pane.refresh();
      draw();
    },
    oncontextmenu: (e: MouseEvent) => {
      e.preventDefault();
      console.info({
        offset: PARAMS.offset,
        zoom: PARAMS.zoom,
        stride: PARAMS.stride,
        iterations: PARAMS.iterations,
      });
    },
  });
  const ctx = canv.getContext("2d")!;

  const pane = new Pane({ title: "Parameters" });
  const tab = pane.addTab({
    pages: [{ title: "Julia" }, { title: "Mandelbrot" }],
  });
  tab.pages[0].addBinding(PARAMS, "julia_c", {
    label: "c",
    x: { min: -1, max: 1 },
    y: { min: -1, max: 1 },
  });
  tab.pages[1].addBinding(PARAMS, "mandel_exponent", {
    label: "exponent",
    min: 2,
    max: 10,
    step: 1,
  });
  tab.on("select", draw);
  pane.addBlade({ view: "separator" });
  pane.addBinding(PARAMS, "iterations", {
    min: 1,
    max: 100,
    step: 1,
    format: (v) => v.toFixed(0),
  });
  pane.addBinding(PARAMS, "stride", {
    min: 1,
    max: 100,
    step: 1,
    format: (v) => v.toFixed(0),
  });
  pane.addBinding(PARAMS, "scale", {
    options: Object.keys(INTERPOLATORS).reduce(
      (acc, key) => ({ ...acc, [key]: key }),
      {}
    ),
  });
  pane.addBinding(PARAMS, "invert");
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

      {
        tab.pages[1].selected = true;
        tab.pages[0].selected = false;
        PARAMS.iterations = 100;
        PARAMS.stride = 1;
        PARAMS.offset = { x: -19.754255103824594, y: 22.3536824833637 };
        PARAMS.zoom = 0.18129028535257674;
        PARAMS.mandel_exponent = 2;
        PARAMS.scale = "Magma";
      }

      draw();

      saveVideo(canv, () => {
        draw();
        const { x, y } = PARAMS.offset;
        PARAMS.zoom *= ZOOM_SCALE;
        PARAMS.offset = { x: x * ZOOM_SCALE, y: y * ZOOM_SCALE };
      }, undefined, { fps: 10, quality: 1 });
    });
  }

  pane.on("change", draw);

  function divergesIn(x: number, y: number) {
    const scale = 4 / PARAMS.zoom;
    const c = new Complex(
      (x / WIDTH) * scale - scale / 2,
      (y / HEIGHT) * scale - scale / 2
    );
    let z = Complex.from(c);

    if (tab.pages[1].selected) {
      // MANDELBROT
      for (let i = 0; i < PARAMS.iterations; i++) {
        z = z.pow(PARAMS.mandel_exponent).add(c);
        if (Math.sqrt(z.real ** 2 + z.imaginary ** 2) > 2) {
          return i;
        }
      }
    } else {
      // JULIA
      for (let i = 0; i < PARAMS.iterations; i++) {
        z = z.pow(2).add(new Complex(PARAMS.julia_c.x, PARAMS.julia_c.y));
        if (Math.sqrt(z.real ** 2 + z.imaginary ** 2) > 2) {
          return i;
        }
      }
    }
    return PARAMS.iterations;
  }

  function draw() {
    const { x: offsetX, y: offsetY } = PARAMS.offset;
    const interpolate = INTERPOLATORS[PARAMS.scale];

    for (let y = 0; y < HEIGHT; y += PARAMS.stride) {
      for (let x = 0; x < WIDTH; x += PARAMS.stride) {
        const i = divergesIn(
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
