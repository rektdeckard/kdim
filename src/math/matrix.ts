import { MatrixLike, Vec } from "../types";

type Input<M extends number, N extends number> =
  | Matrix<M, N>
  | MatrixLike<M, N>
  | number[][];

type Return<
  M extends number,
  N extends number,
  I extends Input<number, number> | number
> = I extends number
  ? Matrix<M, N>
  : I extends Input<infer O, infer P>
  ? N extends O
    ? Matrix<M, P>
    : never
  : never;

/**
 * A concrete Matrix class for simple linear algebra, currently only supporting
 * simple numbers, but with plans to add supoprt for complex numbers.
 *
 * Implements {@link Iterable} over {@link Vec}
 */
export class Matrix<M extends number, N extends number>
  implements Iterable<Vec<N>>
{
  readonly #data: MatrixLike<M, N>;

  constructor(data: MatrixLike<M, N>) {
    this.#data = data;
  }

  get rows() {
    return this.#data.length;
  }

  get cols() {
    return this.#data[0].length;
  }

  get size() {
    return this.rows * this.cols;
  }

  get data(): Readonly<MatrixLike<M, N>> {
    return this.#data;
  }

  static isMatrixLike<M extends number, N extends number>(
    arg: unknown,
    ...dimensions: [m: M, n: N] | []
  ): arg is MatrixLike<M, N> {
    const [m, n] = dimensions;

    return (
      Array.isArray(arg) &&
      Array.isArray(arg[0]) &&
      typeof arg[0][0]?.valueOf() === "number" &&
      ((!m && !n) || (arg.length === m && arg[0].length === n))
    );
  }

  static zero<N extends number>(n: N): Matrix<N, N> {
    if (n <= 0) {
      throw new RangeError(`invalid size ${n}`);
    }

    const data = new Array(n)
      .fill(null)
      .map(() => new Array(n).fill(0)) as MatrixLike<N, N>;

    return new Matrix<N, N>(data);
  }

  static identity<N extends number>(n: N): Matrix<N, N> {
    if (n <= 0) {
      throw new RangeError(`invalid size ${n}`);
    }

    const m = Matrix.zero(n);
    for (let i = 0; i < n; i++) {
      (m.data[i][i] as number) = 1;
    }

    return m;
  }

  static withSize<M extends number, N extends number>(
    m: M,
    n: N
  ): Matrix<M, N> {
    const data = new Array(m)
      .fill(null)
      .map(() => new Array(n).fill(0)) as MatrixLike<M, N>;

    return new Matrix<M, N>(data);
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }

  isSquare(): boolean {
    return this.rows === this.cols;
  }

  at(i: number, j: number) {
    return this.#data.at(i)?.at(j);
  }

  determinant(): number | undefined {
    if (!this.isSquare()) return;

    if (this.size === 1) {
      return this.at(0, 0)!;
    }

    if (this.rows === 2 && this.cols === 2) {
      // 2 x 2 fast path
      return this.at(0, 0)! * this.at(1, 1)! - this.at(1, 0)! * this.at(0, 1)!;
    }

    if (this.rows === 3 && this.cols === 3) {
      // 3 x 3 Rule of Sarrus fast path
      // det(A) = aei + bfg + cdh - ceg - bdi - afh
      return (
        // aei
        this.at(0, 0)! * this.at(1, 1)! * this.at(2, 2)! +
        // bfg
        this.at(0, 1)! * this.at(1, 2)! * this.at(2, 0)! +
        // cdh
        this.at(0, 2)! * this.at(1, 0)! * this.at(2, 1)! -
        // ceg
        this.at(0, 2)! * this.at(1, 1)! * this.at(2, 0)! -
        // bdi
        this.at(0, 1)! * this.at(1, 0)! * this.at(2, 2)! -
        // afh
        this.at(0, 0)! * this.at(1, 2)! * this.at(2, 1)!
      );
    }

    return;
  }

  inverse(): Matrix<N, M> | undefined {
    if (!this.isSquare()) return;

    return;
  }

  transpose(): Matrix<N, M> {
    const m = Matrix.withSize<N, M>(this.cols as N, this.rows as M);

    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.rows; i++) {
        (m.data[j][i] as number) = this.#data[i][j];
      }
    }

    return m;
  }

  add(m: Input<M, N>) {
    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.cols || this.rows !== m.rows) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as MatrixLike<M, N>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! + m.at(i, j)!;
        }
      }

      return new Matrix<M, N>(data);
    }

    if (Matrix.isMatrixLike(m)) {
      // c is MatrixLike
      if (this.rows !== m.length || this.cols !== m[0].length) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols)) as MatrixLike<M, N>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! + m[i][j];
        }
      }

      return new Matrix<M, N>(data);
    } else {
      throw new TypeError(`invalid argument ${m}`);
    }
  }

  sub(m: Input<M, N>) {
    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.cols || this.rows !== m.rows) {
        throw new RangeError(
          `cannot subtract from receiver [${this.rows}x${this.cols}] argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as MatrixLike<M, N>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! - m.at(i, j)!;
        }
      }

      return new Matrix<M, N>(data);
    }

    if (Matrix.isMatrixLike(m)) {
      // c is MatrixLike
      if (this.rows !== m.length || this.cols !== m[0].length) {
        throw new RangeError(
          `cannot subtract from receiver [${this.rows}x${this.cols}] argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols)) as MatrixLike<M, N>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! - m[i][j];
        }
      }

      return new Matrix<M, N>(data);
    } else {
      throw new TypeError(`invalid argument ${m}`);
    }
  }

  mul<I extends Input<number, number> | number>(m: I): Return<M, N, I> {
    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.rows) {
        throw new RangeError(
          `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as MatrixLike<M, number>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < m.cols; j++) {
          (data[i][j] as number) = this.#data[i].reduce((acc, curr, n) => {
            const it = curr * m.at(n, j)!;
            return acc + it;
          }, 0);
        }
      }

      // @ts-ignore
      return new Matrix(data) as Return<M, N, I>;
    }

    if (Matrix.isMatrixLike(m)) {
      // c is MatrixLike
      if (this.cols !== m.length || m[0].length <= 0) {
        throw new RangeError(
          `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m[0].length)) as MatrixLike<M, N>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < m[0].length; j++) {
          (data[i][j] as number) = this.#data[i].reduce((acc, curr, n) => {
            const it = curr * m[n][j];
            return acc + it;
          }, 0);
        }
      }

      return new Matrix(data) as Return<M, N, I>;
    } else if (Array.isArray(m)) {
      // c is malformed array
      throw new RangeError(
        `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.length}x?]`
      );
    } else {
      // c is scalar
      return new Matrix<M, N>(
        this.#data.map((i) => i.map((j) => j * (m as number))) as MatrixLike<
          M,
          N
        >
      ) as Return<M, N, I>;
    }
  }

  pow(k: number): Matrix<M, M> {
    if (k < 0) {
      throw new RangeError(
        "negative exponentiation is not permitted. If matrix is invertible, first invert then use positive exponentiation."
      );
    }

    if (!this.isSquare()) {
      throw new Error("exponentiation is only defined for square matricies");
    }

    if (k === 0) {
      return Matrix.identity<M>(this.cols as M) as Matrix<M, M>;
    } else {
      let acc: Matrix<M, N> = this;
      for (let i = k - 1; i > 0; i--) {
        acc = acc.mul(this) as Matrix<M, N>;
      }

      return acc as unknown as Matrix<M, M>;
    }
  }

  eq(other: Input<M, N>): boolean {
    if (other instanceof Matrix) {
      // o is Matrix
      if (!Matrix.isMatrixLike(other.data, this.rows, this.cols)) return false;
      // @ts-ignore
      return other.data.every((row, i) =>
        row.every((col, j) => col === this.at(i, j))
      );
    }

    if (Matrix.isMatrixLike(other, this.rows, this.cols)) {
      // o is MatrixLike
      // Hack to access array methods on underlying tuples
      return (other as number[][]).every((row, i) =>
        row.every((col, j) => col === this.at(i, j))
      );
    }

    return false;
  }
}
