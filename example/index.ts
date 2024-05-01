import van from "./vendor/van-1.2.3.min";

import MatrixExample from "./matrix";
import ComplexExample from "./complex";
import RangeExample from "./range";
import RandomExample from "./random";
import NoiseExample from "./noise";
import "./index.css";

const { main, h1, p, section } = van.tags;

function Main() {
  return main(
    h1("kdim examples"),
    p("The following examples demonstrate real-world uses for the mathematical types and data structures included. This page also serves as a smoke test for the module as a whole."),
    section(ComplexExample()),
    section(RandomExample()),
    section(RangeExample()),
    section(NoiseExample()),
    section(MatrixExample())
  );
}

van.add(document.body, Main());
