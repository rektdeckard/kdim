import fs from "node:fs";
import { describe, it, expect } from "vitest";
import {
  Matrix,
  MatrixLike,
  Complex,
  Rational,
  Saturating,
} from "../../src/math";
import { Tuple } from "../../src/types";

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
      const m = new Matrix([
        [new Rational(1, 9), new Rational(1, 9), new Rational(1, 9)],
        [new Rational(1, 9), new Rational(1, 9), new Rational(1, 9)],
        [new Rational(1, 9), new Rational(1, 9), new Rational(1, 9)],
      ]);

      expect(m instanceof Matrix).toBe(true);
      expect(m.rows).toBe(3);
      expect(m.cols).toBe(3);
      expect(m.size).toBe(9);
    });
  });

  describe("at", () => {
    const m = new Matrix<3, 3>([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);

    it("can get the value at the specified coordinates", () => {
      expect(m.at(1, 1)).toBe(5);
    });

    it("returns undefined for coordinates outside the matrix", () => {
      expect(m.at(5, 5)).toBeUndefined();
    });
  });

  describe("row", () => {
    const m = new Matrix<3, 3>([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);

    it("can get the specified row", () => {
      expect(m.row(2)).toStrictEqual([3, 6, 9]);
    });

    it("returns undefined for rows outside the matrix", () => {
      expect(m.row(5)).toBeUndefined();
    });
  });

  describe("col", () => {
    const m = new Matrix<3, 3>([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);

    it("can get the specified column", () => {
      expect(m.col(2)).toStrictEqual([7, 8, 9]);
    });

    it("returns undefined for columns outside the matrix", () => {
      expect(m.col(5)).toBeUndefined();
    });
  });

  describe("transpose", () => {
    const m = new Matrix<2, 3>([
      [1, 2, 6],
      [2, 9, -1],
    ]);

    it("transposes correctly", () => {
      const transposedData: MatrixLike<3, 2> = m.transpose().data();
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

      expect(a.add(b).data()).toStrictEqual([
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
        a
          .add([
            [0, 1],
            [0, 0],
          ])
          .data()
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

      expect(m.mul(2).data()).toStrictEqual([
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

      expect(m.mul(n).data()).toStrictEqual([
        [3, 2340],
        [0, 1000],
      ]);

      const a = new Matrix([[5, -7, 9, 0]]);
      const b = new Matrix([[-4], [-1], [7], [-4]]);

      expect(a.mul(b).data()).toStrictEqual([[50]]);
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

      expect(m.mul(n).data()).toStrictEqual([
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

      expect(a.mul(b).data()).toStrictEqual([
        [0, 1],
        [0, 3],
      ]);

      expect(b.mul(a).data()).toStrictEqual([
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
        "Cannot multiply receiver [5x1] by argument [2x2]"
      );

      expect(() => b.mul(a)).toThrowError(
        "Cannot multiply receiver [2x2] by argument [5x1]"
      );

      expect(() => a.mul([[]])).toThrowError(
        "Cannot multiply receiver [5x1] by argument [1x?]"
      );

      expect(() => a.mul([])).toThrowError(
        "Cannot multiply receiver [5x1] by argument [0x?]"
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
        "Negative exponentiation is not permitted. If matrix is invertible, first invert then use positive exponentiation."
      );
    });

    it("returns identity for zeroth power", () => {
      expect(m.pow(0).data()).toStrictEqual(Matrix.identity(m.rows).data());
    });

    it("can exponentiate correctly", () => {
      expect(m.pow(2).data()).toStrictEqual([
        [-5, -18],
        [12, 19],
      ]);

      expect(m.pow(4).data()).toStrictEqual([
        [-191, -252],
        [168, 145],
      ]);
    });
  });

  describe("zero", () => {
    it("can construct a simple zeroed matrix", () => {
      const m = Matrix.zero(2);
      expect(m.data()).toStrictEqual([
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
      expect(() => Matrix.zero(-1)).toThrowError("Invalid matrix size [-1x-1]");
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
      expect(() => Matrix.identity(-1)).toThrowError(
        "Invalid matrix size [-1x-1]"
      );
    });
  });

  describe("withSize", () => {
    it("construct an arbitrary-sized matrix", () => {
      const m = Matrix.withSize(7, 11);
      expect(m.rows).toBe(7);
      expect(m.cols).toBe(11);
    });

    it("constructs a matrix with the fill value", () => {
      const m = Matrix.withSize(4, 3, 10);
      expect(m.rows).toBe(4);
      expect(m.cols).toBe(3);
      expect(
        m
          .data()
          .flat()
          .every((el) => el === 10)
      ).toBe(true);
    });
  });

  describe("fromDiagonal", () => {
    it("constructs a matrix with a given diagonal", () => {
      const diag: Tuple<number, 4> = [1, 4, 8, 16];
      const m = Matrix.fromDiagonal(diag);

      expect(m.isSquare()).toBe(true);

      for (let i = 0; i < m.rows; i++) {
        for (let j = 0; j < m.cols; j++) {
          if (i === j) {
            expect(m.at(i, j)).toBe(diag.at(i));
          } else {
            expect(m.at(i, j)).toBe(0);
          }
        }
      }
    });
  });

  describe("isOrthogonal", () => {
    it("correctly identifies an orthogonal matrix", () => {
      expect(Matrix.identity(2).isOrthogonal()).toBe(true);

      expect(
        new Matrix([
          [1, 0],
          [0, -1],
        ]).isOrthogonal()
      ).toBe(true);

      // FIXME: with rationals, this doesn't work!
      // expect(
      //   new Matrix([
      //     [Math.cos(30), -Math.sin(30)],
      //     [Math.sin(30), Math.cos(30)],
      //   ]).isOrthogonal()
      // ).toBe(true);

      expect(
        new Matrix<4, 4>([
          [0, 0, 0, 1],
          [0, 0, 1, 0],
          [1, 0, 0, 0],
          [0, 1, 0, 0],
        ]).isOrthogonal()
      ).toBe(true);
    });
  });

  describe("submatrix", () => {
    it("can constuct a submatrix by removing columns and rows", () => {
      const m = new Matrix<4, 3>([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ]);

      expect(
        m.submatrix<2, 2>({ removeCols: [1], removeRows: [2, 3] }).data()
      ).toStrictEqual([
        [1, 3],
        [4, 6],
      ]);
    });

    it("can constuct a submatrix by splitting", () => {
      const m = new Matrix<4, 3>([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ]);

      expect(m.submatrix({ xywh: [1, 1] }).data()).toStrictEqual([
        [5, 6],
        [8, 9],
        [11, 12],
      ]);

      expect(m.submatrix({ xywh: [0, 0, 2, 2] }).data()).toStrictEqual([
        [1, 2],
        [4, 5],
      ]);
    });
  });

  describe("eq", () => {
    it("considers sparse, identical matrices equal", () => {
      const a = Matrix.identity(5);
      const b = Matrix.identity(5);
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
    it("throws for non-square matrices", () => {
      const m = Matrix.withSize(3, 6);
      expect(() => m.determinant()).toThrowError(
        "Cannot find determinant of non-square matrix [3x6]"
      );
    });

    it("is trivial for 1 x 1 matrices", () => {
      const m = new Matrix<1, 1>([[9]]);
      expect(m.determinant()?.valueOf()).toBe(9);
    });

    it("is computed for 2 x 2 matrices", () => {
      const m = new Matrix([
        [3, 7],
        [1, -4],
      ]);

      expect(m.determinant()?.valueOf()).toBe(-19);
    });

    it("is computed for 3 x 3 matrices", () => {
      const m = new Matrix([
        [-2, -1, 2],
        [2, 1, 4],
        [-3, 3, -1],
      ]);

      expect(m.determinant()?.valueOf()).toBe(54);
    });

    it("is computed for n x n matrices", () => {
      const m = new Matrix([
        [12, 20, 3, 7],
        [9, -20, -4, 8],
        [69, 69, 420, 420],
        [1, 2, 89, -89],
      ]);

      expect(m.determinant()?.valueOf()).toBe(29469066);

      const n = new Matrix([
        [12, 20, 3, 7, 3],
        [9, -20, -4, 8, 4],
        [69, 69, 420, 420, 5],
        [1, 2, 89, -89, 6],
        [3, 4, 5, 6, 7],
      ]);

      expect(n.determinant()?.valueOf()).toBe(187510379);
    });

    it("is 1 for identity matrices", () => {
      const two = Matrix.identity(2);
      expect(two.determinant()?.valueOf()).toBe(1);

      const three = Matrix.identity(3);
      expect(three.determinant()?.valueOf()).toBe(1);

      const ten = Matrix.identity(9);
      expect(ten.determinant()?.valueOf()).toBe(1);
    });
  });

  describe("augment", () => {
    it("can augment matrices with same row count", () => {
      const a = new Matrix<2, 2>([
        [-1, 3 / 2],
        [1, -1],
      ]);

      const i = Matrix.identity(2, "rational");
      const aug = a.augment(i);

      expect(aug.data()).toStrictEqual([
        [-1, 3 / 2, 1, 0],
        [1, -1, 0, 1],
      ]);
    });

    it("throws with incorrect size augmentation", () => {
      const a = new Matrix<2, 2>([
        [-1, 3 / 2],
        [1, -1],
      ]);

      const i = Matrix.identity(3);
      // @ts-ignore
      expect(() => a.augment(i)).toThrowError();
    });
  });

  describe("inverse", () => {
    it("can invert a simple matrix", () => {
      const m = new Matrix<3, 3>([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, -7],
      ]);

      expect(m.inverse()!.data()).toStrictEqual([
        [1 / 2, 0, 0],
        [0, 1 / 3, 0],
        [-0, -0, -1 / 7],
      ]);
    });

    it("throws when inverting a non-square matrix", () => {
      const m = new Matrix<2, 1>([[7], [2]]);
      expect(() => m.inverse()).toThrowError(
        "Cannot invert non-square matrix [2x1]"
      );
    });

    it("inverts a random matrix", () => {
      // TODO: need infinite precision floats or fractions to handle this correctly
      const a = new Matrix<3, 3>([
        [2, -1, 0],
        [-1, 2, -1],
        [0, -1, 2],
      ]);

      expect(a.inverse()?.data()).toStrictEqual([
        [3 / 4, 1 / 2, 1 / 4],
        [1 / 2, 1, 1 / 2],
        [1 / 4, 1 / 2, 3 / 4],
      ]);

      const m = new Matrix<3, 3>([
        [-3, 2, -1],
        [6, -6, 7],
        [3, -4, 4],
      ]);

      expect(m.inverse()?.data()).toStrictEqual([
        [-1 / 3, 1 / 3, -2 / 3],
        [1 / 4, 3 / 4, -5 / 4],
        [1 / 2, 1 / 2, -1 / 2],
      ]);
    });
  });

  describe("vectorize", () => {
    it("returns the flattened matrix", () => {
      const m = new Matrix([
        [1, 2, 3, 4, 5, 6],
        [3, 6, 8, 12, 15, 18],
      ]);

      expect(m.vectorize()).toStrictEqual([
        1, 2, 3, 4, 5, 6, 3, 6, 8, 12, 15, 18,
      ]);
    });
  });

  describe("trace", () => {
    it("returns the trace of a simple matrix", () => {
      const m = new Matrix<3, 3>([
        [1, 0, 3],
        [11, 5, 2],
        [6, 12, -5],
      ]);

      expect(m.trace().valueOf()).toBe(1);
    });

    it("is the same of a transposed matrix", () => {
      const m = new Matrix([
        [1, 2, 4, 8],
        [3, 6, 9, 10],
        [-10, 10, -5, 0],
        [41, 42, 43, 44],
      ]);

      expect(m.trace().valueOf()).toBe(46);
      expect(m.trace().valueOf()).toBe(m.transpose().trace().valueOf());
    });

    it("adheres to transitivity rules", () => {
      const a = new Matrix<3, 3>([
        [-9, 4, 1],
        [3, -3, 0],
        [5, 1, 2],
      ]);

      const b = new Matrix<3, 3>([
        [8, -5, 1],
        [2, 0, -1],
        [3, 5, 6],
      ]);

      const atb = a.transpose().mul(b).trace().valueOf();
      const abt = a.mul(b.transpose()).trace().valueOf();
      const bta = b.transpose().mul(a).trace().valueOf();
      const bat = b.mul(a.transpose()).trace().valueOf();

      expect(atb === abt && abt === bta && bta === bat).toBe(true);
      expect(a.mul(b).trace().valueOf()).toBe(b.mul(a).trace().valueOf());
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

      expect(Matrix.isMatrixLike(Matrix.identity(5))).toBe(true);
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

      const x = new Matrix([
        [-3, -3],
        [5, -6],
      ]);

      const y = new Matrix([
        [1, 3],
        [6, -6],
      ]);

      expect(x.pow(2).sub(y.pow(2)).data()).toStrictEqual([
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
      expect(ans.data()).toStrictEqual([
        [16, 0],
        [-180, 196],
      ]);
    });
  });

  describe("parse", () => {
    describe("fromMTX", () => {
      it("can parse spec 1.1.1", () => {
        const data = fs
          .readFileSync("./test/fixtures/matrix/spec-1.1.1.mtx")
          .toString();
        const m = Matrix.fromMTX(data);

        expect(m.rows).toBe(5);
        expect(m.cols).toBe(5);

        expect(
          m.eq([
            [1.0, 0, 0, 6, 0],
            [0, 10.5, 0, 0, 0],
            [0, 0, 0.015, 0, 0],
            [0, 250.5, 0, -280, 33.32],
            [0, 0, 0, 0, 12],
          ])
        ).toBe(true);
      });

      it("can parse spec 1.2.3", () => {
        const data = fs
          .readFileSync("./test/fixtures/matrix/spec-1.2.3.mtx")
          .toString();
        const m = Matrix.fromMTX(data, { format: "array" });

        expect(m.rows).toBe(4);
        expect(m.cols).toBe(3);

        expect(
          m.eq([
            [1, 5, 9],
            [2, 6, 10],
            [3, 7, 11],
            [4, 8, 12],
          ])
        ).toBe(true);
      });

      it.skip("can parse and return coordinate real general .mtx", () => {
        const data = fs
          .readFileSync("./test/fixtures/matrix/mcca.mtx")
          .toString();

        const m = Matrix.fromMTX<180, 180>(data, {
          format: "coordinate",
          field: "real",
        });

        expect(m.rows).toBe(180);
        expect(m.cols).toBe(180);
      });
    });
  });

  describe("dot product", () => {
    it("multiplies two column vetors", () => {
      const x = new Matrix<3, 1>([[1], [3], [-5]]);
      const y = new Matrix<3, 1>([[4], [-2], [-1]]);

      expect(x.transpose().mul(y).vectorize()[0]).toBe(3);
    });

    it("performs dot", () => {
      const x = new Matrix<3, 1>([[1], [3], [-5]]);
      const y = new Matrix<3, 1>([[4], [-2], [-1]]);

      expect(x.dot(y).valueOf()).toBe(3);
      expect(x.dot([[3], [3], [3]]).valueOf()).toBe(-3);
    });

    it("throws with incorrect dot product operands", () => {
      const x = new Matrix<1, 3>([[1, 3, -5]]);
      // @ts-ignore
      expect(() => x.dot(x)).toThrowError();

      // @ts-ignore
      expect(() => x.dot(5)).toThrowError();

      expect(() => x.dot(Matrix.identity(1, "rational"))).toThrowError();
    });
  });
});
