import { describe, it, expect } from "vitest";
import { Matrix, MatrixLike, Saturating } from "../../src";

describe("Matrix", () => {
  describe("new Matrix", () => {
    it("can be constructed from MatrixLike", () => {
      const data: MatrixLike<2, 3> = [
        [1, 2, 6],
        [2, 9, -1],
      ];

      const m = new Matrix(data);

      expect(m.rows).toBe(2);
      expect(m.cols).toBe(3);
      expect(m.size).toBe(6);
    });

    it("can be constructed with exotic number types", () => {
      const m = new Matrix<3, 3, Saturating>([
        [
          new Saturating({ max: 7 }, 2),
          new Saturating({ max: 15 }, 2),
          new Saturating({ max: 31 }, 2),
        ],
        [
          new Saturating({ max: 7 }, 2),
          new Saturating({ max: 15 }, 2),
          new Saturating({ max: 31 }, 2),
        ],
        [
          new Saturating({ max: 7 }, 2),
          new Saturating({ max: 15 }, 2),
          new Saturating({ max: 31 }, 2),
        ],
      ]);

      expect(m instanceof Matrix).toBe(true);
      expect(m.rows).toBe(3);
      expect(m.cols).toBe(3);
      expect(m.size).toBe(9);
    });
  });

  describe("transpose", () => {
    const m = new Matrix<2, 3>([
      [1, 2, 6],
      [2, 9, -1],
    ]);

    it("transposes correctly", () => {
      const transposedData: MatrixLike<3, 2> = m.transpose().data;
      expect(transposedData).toStrictEqual([
        [1, 2],
        [2, 9],
        [6, -1],
      ]);
    });
  });

  describe("addition", () => {
    it("adds to a suitable Matrix", () => {
      const a = new Matrix([
        [1, 2],
        [3, 4],
      ]);

      const b = new Matrix([
        [0, 1],
        [0, 0],
      ]);

      expect(a.add(b).data).toStrictEqual([
        [1, 3],
        [3, 4],
      ]);
    });

    it("adds to a suitable MatrixLike", () => {
      const a = new Matrix([
        [1, 2],
        [3, 4],
      ]);

      expect(
        a.add([
          [0, 1],
          [0, 0],
        ]).data
      ).toStrictEqual([
        [1, 3],
        [3, 4],
      ]);
    });
  });

  describe("multiplication", () => {
    it("multiplies by a scalar", () => {
      const m = new Matrix<2, 3>([
        [1, 8, -3],
        [4, -2, 5],
      ]);

      expect(m.mul(2)!.data).toStrictEqual([
        [2, 16, -6],
        [8, -4, 10],
      ]);
    });

    it("multiplies by a suitable Matrix", () => {
      const m = new Matrix<2, 3>([
        [2, 3, 4],
        [1, 0, 0],
      ]);

      const n = new Matrix<3, 2>([
        [0, 1000],
        [1, 100],
        [0, 10],
      ]);

      expect(m.mul(n).data).toStrictEqual([
        [3, 2340],
        [0, 1000],
      ]);

      const a = new Matrix([[5, -7, 9, 0]]);
      const b = new Matrix([[-4], [-1], [7], [-4]]);

      expect([...a.mul(b)]).toStrictEqual([[50]]);
    });

    it("multiplies by a suitable MatrixLike", () => {
      const m = new Matrix<2, 3>([
        [2, 3, 4],
        [1, 0, 0],
      ]);

      const n = [
        [0, 1000],
        [1, 100],
        [0, 10],
      ];

      expect(m.mul(n).data).toStrictEqual([
        [3, 2340],
        [0, 1000],
      ]);
    });

    it("abides non-commutativity", () => {
      const a = new Matrix([
        [1, 2],
        [3, 4],
      ]);

      const b = new Matrix([
        [0, 1],
        [0, 0],
      ]);

      expect(a.mul(b).data).toStrictEqual([
        [0, 1],
        [0, 3],
      ]);

      expect(b.mul(a).data).toStrictEqual([
        [3, 4],
        [0, 0],
      ]);
    });

    it("throws with incorrect sizes", () => {
      const a = new Matrix<5, 1>([[23], [34], [57], [334], [12]]);
      const b = new Matrix<2, 2>([
        [99, 101],
        [0, 1],
      ]);

      expect(() => a.mul(b)).toThrowError(
        "cannot multiply receiver [5x1] by argument [2x2]"
      );

      expect(() => b.mul(a)).toThrowError(
        "cannot multiply receiver [2x2] by argument [5x1]"
      );

      expect(() => a.mul([[]])).toThrowError(
        "cannot multiply receiver [5x1] by argument [1x0]"
      );

      expect(() => a.mul([])).toThrowError(
        "cannot multiply receiver [5x1] by argument [0x?]"
      );
    });
  });

  describe("exponentiation", () => {
    const m = new Matrix([
      [1, -3],
      [2, 5],
    ]);

    it("throws with negative exponent", () => {
      expect(() => m.pow(-1)).toThrowError("cannot raise to a negative power");
    });

    it("returns identity for zeroth power", () => {
      expect(m.pow(0).data).toStrictEqual(Matrix.identity(m.rows).data);
    });

    it("can exponentiate correctly", () => {
      expect(m.pow(2).data).toStrictEqual([
        [-5, -18],
        [12, 19],
      ]);

      expect(m.pow(4).data).toStrictEqual([
        [-191, -252],
        [168, 145],
      ]);
    });
  });

  describe("identity", () => {
    it("can construct a simple identity", () => {
      const m = Matrix.identity(2);
      expect([...m]).toStrictEqual([
        [1, 0],
        [0, 1],
      ]);
    });

    it("can construct an identity from a variable", () => {
      const n = 4;
      const m = Matrix.identity(n);
      expect([...m]).toStrictEqual([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]);
    });

    it("throws with invalid size", () => {
      expect(() => Matrix.identity(-1)).toThrowError("invalid size -1");
    });
  });

  describe("real-world examples", () => {
    it("pow and sub", () => {
      // Given the matricies

      // x = | -3  -3 |   y = | 1    3 |
      //     |  5  -6 |       | 6   -6 |

      // What is x^2 - y^2?

      expect(
        new Matrix([
          [-3, -3],
          [5, -6],
        ])
          .pow(2)
          .sub(
            new Matrix([
              [1, 3],
              [6, -6],
            ]).pow(2)
          ).data
      ).toStrictEqual([
        [-25, 42],
        [-15, -33],
      ]);
    });

    it("mul, sub, and pow", () => {
      // Given the matrix

      // a = |  4   0 |
      //     | -3   7 |

      // calculate a^3 -3a^2

      const a = new Matrix<2, 2>([
        [4, 0],
        [-3, 7],
      ]);

      const ans = a.pow(3).sub(a.pow(2).mul(3));
      expect(ans.data).toStrictEqual([
        [16, 0],
        [-180, 196],
      ]);
    });
  });
});
