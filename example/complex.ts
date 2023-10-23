import van from "./van-1.2.3.min";
import { Complex } from "../src";

import "./index.css";

const { math, msup, mrow, mo, mi, mn } = van.tagsNS(
  "http://www.w3.org/1998/Math/MathML"
);

function ComplexObject({ complex }: { complex: Complex }) {
  const { real, imaginary } = complex;
  const elements: Element[] = [];

  if (!!real || !imaginary) {
    if (real < 0) {
      elements.push(mo("−"));
    }
    elements.push(mn(Math.abs(real)));
  }

  if (!!imaginary) {
    if (imaginary < 0) {
      elements.push(mo("−"));
    } else if (real) {
      elements.push(mo("+"));
    }

    elements.push(mn(Math.abs(imaginary)), mi("i"));
  }

  return elements;
}

export default function () {
  const c1 = new Complex(5, -2);

  return math(
    { display: "block" },
    msup(mrow(mo("("), ComplexObject({ complex: c1 }), mo(")")), mn(2)),
    mo("="),
    ComplexObject({ complex: c1.pow(2) })
  );
}
