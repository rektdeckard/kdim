import van from "./vendor/van-1.2.3.min";
import { Random, type PRNG } from "../src";

import "./index.css";

const { div, button, label, input, pre, canvas } = van.tags;

export default function Randoms() {
  return div(Rngs(), Collections());
}

function Rngs() {
  const WIDTH = 400;
  const HEIGHT = 400;

  const c = canvas({ width: WIDTH, height: HEIGHT });
  const ctx = c.getContext("2d")!;
  let rng: PRNG = new Random.Seedable(0);

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  function rand() {
    ctx.fillStyle = "#FF0C7C40";

    for (let i = 0; i < iters.val; i++) {
      const pos = rng.integer({ max: WIDTH * HEIGHT });
      const [x, y] = [pos % WIDTH, Math.floor(pos / WIDTH)];
      ctx.fillRect(x, y, 1, 1);
    }

    if (run.val) {
      raf = requestAnimationFrame(rand);
    }
  }

  const run = van.state(false);
  const iters = van.state(100);
  let raf: number;
  let fn: () => void = rand;

  return div(
    { class: "iflexy" },
    div(
      { class: "flexy" },
      button(
        {
          onclick: () => {
            clear();
            rng = new Random.Mulberry32(0);
          },
        },
        "Mulberry32"
      ),
      button(
        {
          onclick: () => {
            clear();
            rng = new Random.SplitMix32(0);
          },
        },
        "SplitMix32"
      ),
      button(
        {
          onclick: () => {
            clear();
            rng = new Random.SFC32(0, 1, 2, 3);
          },
        },
        "SFC32"
      ),
      button(
        {
          onclick: () => {
            clear();
            rng = new Random.JSF32B(0, 1, 2, 3);
          },
        },
        "JSF32B"
      ),
      button(
        {
          onclick: () => {
            clear();
            rng = new Random.GJRand32(0, 1, 2, 3);
          },
        },
        "GJRand32"
      )
    ),
    c,
    div(
      { class: "flexy" },
      div(
        { class: "iflex" },
        button(
          {
            onclick: () => {
              run.val = true;
              cancelAnimationFrame(raf);
              fn();
            },
          },
          "Start"
        ),
        button(
          {
            onclick: () => {
              run.val = false;
              cancelAnimationFrame(raf);
            },
          },
          "Stop"
        ),
        button({ onclick: clear }, "Clear")
      ),
      label(
        "Speed",
        input({
          type: "range",
          defaultValue: iters.val,
          min: 0,
          max: 1000,
          step: 1,
          oninput: (e) => {
            iters.val = e.target.valueAsNumber;
          },
        })
      )
    )
  );
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
