import { describe, it, expect } from "vitest";
import { Fourier, Complex, Range } from "../../src/math";

function createComplexVec(input: [r: number, i?: number][]): Complex[] {
  return input.map(([r, c]) => new Complex(r, c));
}

function expectComplexToApproxEq(
  c: Complex,
  e: [r: number, i: number],
  p: number
) {
  expect(c.real).toBeCloseTo(e[0], p);
  expect(c.imaginary).toBeCloseTo(e[1], p);
}

function expectComplexVecToApproxEqual(
  v: Complex[],
  e: [r: number, i: number][],
  p: number = 6
) {
  v.forEach((c, i) => {
    expectComplexToApproxEq(c, e[i], p);
  });
}

describe("dft", () => {
  it("computes sample dft", () => {
    expectComplexVecToApproxEqual(
      Fourier.dft(
        createComplexVec([
          [1, 0],
          [2, -1],
          [0, -1],
          [-1, 2],
        ])
      ),
      [
        [2, 0],
        [-2, -2],
        [0, -2],
        [4, 4],
      ]
    );

    expectComplexVecToApproxEqual(
      Fourier.dft(createComplexVec([[1], [1], [0], [0]])),
      [
        [2, 0],
        [1, -1],
        [0, 0],
        [1, 1],
      ]
    );
  });

  it("computes dft of a real function", () => {
    // https://en.wikipedia.org/wiki/Discrete_Fourier_transform#/media/File:DFT_2sin(t)_+_cos(4t)_25_points.svg
    const s = Range.of(24, (t) =>
      Complex.from(
        2 * Math.sin((2 * Math.PI * t) / 25) + Math.cos((8 * Math.PI * t) / 25)
      )
    );

    expectComplexVecToApproxEqual(
      Fourier.dft(s),
      [
        [0, 0],
        [0, -25],
        [0, 0],
        [0, 0],
        [12.5, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [12.5, 0],
        [0, 0],
        [0, 0],
        [0, 25],
      ],
      10
    );
  });

  it("deals with primitive numbers", () => {
    const s = [4, 43, 27, 30, 42, 25, 17, 37, 25, 37, 4];

    expectComplexVecToApproxEqual(
      Fourier.dft(s),
      [
        [291, 0],
        [-29.735, -22.97],
        [-47.069, -17.235],
        [-2.294, -45.621],
        [-47.97, -36.207],
        [3.567, -23.543],
        [3.567, 23.543],
        [-47.97, 36.207],
        [-2.294, 45.621],
        [-47.069, 17.235],
        [-29.735, 22.97],
      ],
      3
    );
  });
});
