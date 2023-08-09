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
      const m = new Matrix<3, 3>([
        [
          new Saturating({ max: 7 }, 2).valueOf(),
          new Saturating({ max: 15 }, 2).valueOf(),
          new Saturating({ max: 31 }, 2).valueOf(),
        ],
        [
          new Saturating({ max: 7 }, 2).valueOf(),
          new Saturating({ max: 15 }, 2).valueOf(),
          new Saturating({ max: 31 }, 2).valueOf(),
        ],
        [
          new Saturating({ max: 7 }, 2).valueOf(),
          new Saturating({ max: 15 }, 2).valueOf(),
          new Saturating({ max: 31 }, 2).valueOf(),
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

      expect(m.mul(2).data).toStrictEqual([
        [2, 16, -6],
        [8, -4, 10],
      ]);
    });

    it("does type wizardry", () => {
      const row = new Matrix<1, 5>([[23, 65, 72, 10, 81]]);
      const col = new Matrix<5, 1>([[12], [54], [70], [39], [69]]);
      const other = new Matrix<1, 2>([[13, 15]]);

      expect(col.mul(row)).toBeDefined();
      expect(row.mul(col)).toBeDefined();
      expect(col.mul(other)).toBeDefined();
      expect(() => other.mul(col)).toThrow();
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
        "cannot multiply receiver [5x1] by argument [1x?]"
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
      expect(() => m.pow(-1)).toThrowError(
        "negative exponentiation is not permitted. If matrix is invertible, first invert then use positive exponentiation."
      );
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

  describe("zero", () => {
    it("can construct a simple zeroed matrix", () => {
      const m = Matrix.zero(2);
      expect([...m]).toStrictEqual([
        [0, 0],
        [0, 0],
      ]);
    });

    it("can construct a zeroed matrix from a variable", () => {
      const n = 4;
      const m = Matrix.zero(n);
      expect([...m]).toStrictEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });

    it("throws with invalid size", () => {
      expect(() => Matrix.zero(-1)).toThrowError("invalid size -1");
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

  describe("withSize", () => {
    it("construct an arbitrary-sized matrix", () => {
      const m = Matrix.withSize(7, 11);
      expect(m.rows).toBe(7);
      expect(m.cols).toBe(11);
    });
  });

  describe("eq", () => {
    it("considers sparse, identical matrices equal", () => {
      const a = Matrix.identity(5);
      const b = Matrix.identity(5);

      const x = a.mul(b);
      const c = Matrix.zero(5);
      const d = new Matrix<5, 5>([
        [5, 5, 5, 5, 5],
        [5, 5, 5, 5, 5],
        [5, 5, 5, 5, 5],
        [5, 5, 5, 5, 5],
        [5, 5, 5, 5, 5],
      ]);
      const e = Matrix.identity(3);

      expect(a.eq(b)).toBe(true);
      expect(b.eq(a)).toBe(true);

      expect(a.eq(c)).toBe(false);
      expect(c.eq(d)).toBe(false);
      expect(d.eq(c)).toBe(false);
      // @ts-ignore
      expect(a.eq(e)).toBe(false);
    });

    it("considers dense, identical matrices equal", () => {
      const data: MatrixLike<3, 3> = [
        [49, -20, 1],
        [150, -43, -9],
        [22, 22, 22],
      ];
      const data2: MatrixLike<3, 3> = [
        [49, -20, 1],
        [150, -43, -9],
        [22, 22, 22],
      ];

      const a = new Matrix(data);
      const b = new Matrix(data);
      const c = new Matrix(data2);

      expect(a.eq(b)).toBe(true);
      expect(b.eq(a)).toBe(true);
      expect(b.eq(c)).toBe(true);
    });
  });

  describe("determinant", () => {
    it("is undefined for non-square matrices", () => {
      const m = Matrix.withSize(3, 6);
      expect(m.determinant()).toBeUndefined();
    });

    it("is trivial for 1 x 1 matrices", () => {
      const m = new Matrix<1, 1>([[9]]);
      expect(m.determinant()).toBe(9);
    });

    it("is computed for 2 x 2 matrices", () => {
      const m = new Matrix([
        [3, 7],
        [1, -4],
      ]);

      expect(m.determinant()).toBe(-19);
    });

    it("is computed for 3 x 3 matrices", () => {
      const m = new Matrix([
        [-2, -1, 2],
        [2, 1, 4],
        [-3, 3, -1],
      ]);

      expect(m.determinant()).toBe(54);
    });

    // it("is computed for n x n matrices", () => {
    //   expect(false).toBe(true);
    // });

    it("is 1 for identity matrices", () => {
      const two = Matrix.identity(2);
      expect(two.determinant()).toBe(1);

      const three = Matrix.identity(3);
      expect(three.determinant()).toBe(1);

      const ten = Matrix.identity(10);
      //   expect(ten.determinant()).toBe(1);
    });
  });

  describe("isMatrixLike", () => {
    it("is generally discriminatory of mismatched types", () => {
      const v1 = [
        [5, 2, 15],
        [9, 7, 11],
      ];
      expect(Matrix.isMatrixLike(v1)).toBe(true);

      const v2 = [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ];
      expect(Matrix.isMatrixLike(v2)).toBe(false);

      const v3 = 7;
      expect(Matrix.isMatrixLike(v3)).toBe(false);

      const v4 = [1, 2, 3];
      expect(Matrix.isMatrixLike(v4)).toBe(false);
    });

    it("can validate specific sizes", () => {
      const v1 = [
        [5, 2, 15],
        [9, 7, 11],
      ] as const;

      expect(Matrix.isMatrixLike(v1, 2, 3)).toBe(true);
      expect(Matrix.isMatrixLike(v1, 5, 10)).toBe(false);
    });
  });

  describe("real-world examples", () => {
    it("pow and sub", () => {
      // Given the matrices

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
