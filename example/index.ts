import van from "./vendor/van-1.2.3.min";

import MatrixExample from "./matrix";
import ComplexExample from "./complex";
import RangeExample from "./range";
import RandomExample from "./random";
import NoiseExample from "./noise";
import "./index.css";

const { main, h1, code, section } = van.tags;

function Main() {
  return main(
    h1("kdim examples"),
    section(ComplexExample()),
    section(RandomExample()),
    section(RangeExample()),
    section(NoiseExample()),
    section(MatrixExample())
  );
}

van.add(document.body, Main());
