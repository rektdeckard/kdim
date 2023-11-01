import van, { ChildDom } from "./vendor/van-1.2.3.min";

import MatrixExample from "./matrix";
import ComplexExample from "./complex";
import RangeExample from "./range";
import RandomExample from "./random";
import NoiseExample from "./noise";

import "./index.css";

const { div, main, details, summary } = van.tags;

function Detail(s: string, open: boolean, ...children: ChildDom[]) {
  return details({ open }, summary(s), div({ class: "flexy" }, ...children));
}

function Main() {
  return main(
    {},
    Detail("Matrix", false, MatrixExample()),
    Detail("Complex", false, ComplexExample()),
    Detail("Range", false, RangeExample()),
    Detail("Random", false, RandomExample()),
    Detail("Noise", true, NoiseExample())
  );
}

van.add(document.body, Main());
