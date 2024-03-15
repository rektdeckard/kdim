import van from "./vendor/van-1.2.3.min";
import { Matrix } from "../src";

const { h2 } = van.tags;
const { math, mtr, mtd, mtable, msub, msup, mrow, mo, mi, mn } = van.tagsNS(
  "http://www.w3.org/1998/Math/MathML"
);

function MatrixObject({ matrix, det }: { matrix: Matrix; det?: boolean }) {
  const elements = matrix.data.map((row) =>
    mtr({}, ...row.map((col) => mtd(mn(col))))
  );

  const bars = det ? ["|", "|"] : ["[", "]"];

  return [
    mo(bars[0]),
    mtable({ frame: "solid", rowlines: "solid", align: "axis 3" }, ...elements),
    mo(bars[1]),
  ];
}

type MatrixDisplayProps = {
  name: string | { text: string; sub: string };
  matrix: Matrix<number, number>;
};

function MatrixDisplay({ name, matrix }: MatrixDisplayProps) {
  const label =
    typeof name === "string" ? mi(name) : msub(mi(name.text), mn(name.sub));

  const elements = matrix.data.map((row) =>
    mtr({}, ...row.map((col) => mtd(mn(col))))
  );

  return math({ display: "block" }, label, mo("="), MatrixObject({ matrix }));
}

function MMult() {
  const m1 = new Matrix<3, 5>([
    [43, 0, 1, 99, 420],
    [7, 39, -66, -4, 0],
    [7, 39, -66, -4, 0],
  ]);

  const m2 = new Matrix<5, 1>([[1], [1], [1], [1], [1]]);

  return math(
    { display: "block" },
    mrow({}, MatrixObject({ matrix: m1 })),
    mo("×"),
    mrow({}, MatrixObject({ matrix: m2 })),
    mo("="),
    mrow({}, MatrixObject({ matrix: m1.mul(m2) }))
  );
}

function MDet() {
  const m = new Matrix([
    [-2, -1, 2],
    [2, 1, 4],
    [-3, 3, -1],
  ]);

  return [
    math(
      { display: "block" },
      mi("A"),
      mo("="),
      mrow({}, MatrixObject({ matrix: m, det: false }))
    ),
    math(
      { display: "block" },
      msub(mi("det"), mi("A")),
      mo("="),
      mrow({}, MatrixObject({ matrix: m, det: true })),
      mo("="),
      mn(m.determinant())
    ),
  ];
}

export default function () {
  return [
    h2("Matrix math"),
    MatrixDisplay({
      name: "S",
      matrix: new Matrix<2, 2>([
        [3, 2],
        [-6, 6],
      ]),
    }),
    MatrixDisplay({
      name: { text: "I", sub: "3" },
      matrix: Matrix.identity(3),
    }),
    MatrixDisplay({ name: { text: "Z", sub: "3" }, matrix: Matrix.zero(3) }),
    MMult(),
    MDet(),
  ];
}
