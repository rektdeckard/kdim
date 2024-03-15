import van from "./vendor/van-1.2.3.min";
import { Pane } from "tweakpane";
import { ButtonApiEvents } from "@tweakpane/core";
import * as Essentials from "@tweakpane/plugin-essentials";
import { SideBy, Example } from "./components";
import { Random, type PRNG } from "../src";

const { div, h2, pre, canvas, p } = van.tags;

declare module "@tweakpane/core" {
  interface BladeApi {
    on<EventName extends keyof ButtonApiEvents>(
      eventName: EventName,
      handler: (
        ev: ButtonApiEvents[EventName] & { index: [number, number] }
      ) => void
    ): this;
  }
}

export default function Randoms() {
  return SideBy(
    {
      right: [
        h2("Seedable random numbers"),
        p(
          "Ultrices gravida dictum fusce ut. Tristique magna sit amet purus. Condimentum id venenatis a condimentum vitae. Dui id ornare arcu odio ut sem. Turpis massa tincidunt dui ut. Nullam vehicula ipsum a arcu cursus vitae congue. Venenatis tellus in metus vulputate eu scelerisque felis. Sed adipiscing diam donec adipiscing tristique risus. Lacus laoreet non curabitur gravida arcu ac tortor. Et netus et malesuada fames. Imperdiet massa tincidunt nunc pulvinar sapien et ligula. Morbi tristique senectus et netus et malesuada."
        ),
        Collections(),
        p(
          "Sodales ut eu sem integer vitae justo eget magna. Arcu dui vivamus arcu felis bibendum ut tristique. Mauris rhoncus aenean vel elit. Suspendisse interdum consectetur libero id faucibus nisl tincidunt eget. Nisl purus in mollis nunc. Egestas fringilla phasellus faucibus scelerisque. Integer malesuada nunc vel risus. Mattis pellentesque id nibh tortor. Laoreet suspendisse interdum consectetur libero. Vivamus at augue eget arcu dictum varius duis. Bibendum at varius vel pharetra vel turpis nunc eget. Id semper risus in hendrerit gravida. Sed velit dignissim sodales ut. Massa sed elementum tempus egestas sed sed risus pretium. Proin libero nunc consequat interdum varius sit amet mattis vulputate. Eros donec ac odio tempor orci dapibus ultrices."
        ),
      ],
    },
    Rngs()
  );
}

function Rngs() {
  const WIDTH = 400;
  const HEIGHT = 400;
  const RNGS = {
    Default: Random,
    Mulberry32: new Random.Mulberry32(0),
    SplitMix32: new Random.SplitMix32(0),
    SFC32: new Random.SFC32(0, 1, 2, 3),
    JSF32B: new Random.JSF32B(0, 1, 2, 3),
    GJRand32: new Random.GJRand32(0, 1, 2, 3),
  } as const;
  const PARAMS = { run: false, speed: 200, rng: "Default" };

  const canv = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = canv.getContext("2d")!;
  let raf: number;

  function clear() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#8781bc40";
  }

  function draw() {
    const rng = RNGS[PARAMS.rng];

    for (let i = 0; i < PARAMS.speed; i++) {
      const pos = rng.integer({ max: WIDTH * HEIGHT });
      const [x, y] = [pos % WIDTH, Math.floor(pos / WIDTH)];
      ctx.fillRect(x, y, 1, 1);
    }

    if (PARAMS.run) {
      raf = requestAnimationFrame(draw);
    }
  }

  const pane = new Pane({ title: "Parameters" });
  pane.registerPlugin(Essentials);
  pane
    .addBinding(PARAMS, "rng", {
      options: Object.keys(RNGS).reduce(
        (acc, key) => ({ ...acc, [key]: key }),
        {}
      ),
    })
    .on("change", (e) => {
      cancelAnimationFrame(raf);
      draw();
    });
  pane.addBinding(PARAMS, "speed", { min: 0, max: 1000, step: 1 });

  pane.addBlade({ view: "separator" });
  pane
    .addBlade({
      view: "buttongrid",
      size: [3, 1],
      cells: (x: number) => ({
        title: ["Start", "Stop", "Clear"][x],
      }),
    })
    .on("click", (ev) => {
      const idx = ev.index[0];

      switch (idx) {
        case 0:
          PARAMS.run = true;
          cancelAnimationFrame(raf);
          draw();
          break;
        case 1:
          PARAMS.run = false;
          cancelAnimationFrame(raf);
          break;
        case 2:
          clear();
          break;
      }
    });

  clear();
  return Example(canv, pane.element);
}

function Collections() {
  const friends = ["alice", "bob", "carlos", "dan", "erin"];
  const secretSantas = Random.derangement(friends);

  return div(
    pre(`\
const friends = ${JSON.stringify(friends)};
const secretSantas = Random.derangement(friends);\
    `),
    pre(JSON.stringify(friends)),
    pre(JSON.stringify(secretSantas))
  );
}
