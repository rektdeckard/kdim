import van from "./vendor/van-1.2.3.min";
import { Range } from "../src";

import "./index.css";

const { h2 } = van.tags;
const { math, mrow, mo, mi, mn } = van.tagsNS(
  "http://www.w3.org/1998/Math/MathML"
);

type RN = typeof Range.of<number>;
type RangeParams = Parameters<RN>;

function RangeObject(...args: RangeParams) {
  const [where, ctor] = args;
  let {
    from = 0,
    to = 0,
    step = 1,
  } = typeof where === "object" ? where : { to: where };

  if (from > to) {
    step *= -1;
  }

  return [mo("["), mn(from), mi(","), mn(to), mi(":"), mn(step), mo("]")];
}

function RangeDisplay(...args: RangeParams) {
  return math(
    { display: "block" },
    mrow(
      RangeObject(...args),
      mi("="),
      mo("["),
      ...Range.of(...args).map((el) => mn(el)),
      mo("]")
    )
  );
}

export default function () {
  return [
    h2("Ranges and sequences"),
    RangeDisplay(5),
    RangeDisplay({ from: 13, to: 9 }),
  ];
}
