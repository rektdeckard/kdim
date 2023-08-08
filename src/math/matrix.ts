import { MatrixLike, Tuple } from "../types";

export class Matrix<
  M extends number,
  N extends number,
  D extends Number = number
> implements Iterable<Tuple<D, N>>
{
  #data: MatrixLike<M, N, D>;

  constructor(data: MatrixLike<M, N, D>) {
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

  get data() {
    return this.#data;
  }

  static isMatrixLike<
    M extends number,
    N extends number,
    D extends Number = number
  >(arg: D | MatrixLike<M, N, D> | unknown): arg is MatrixLike<M, N, D> {
    return Array.isArray(arg) && Array.isArray(arg[0]);
  }

  static identity<N extends number>(n: N): Matrix<N, N, number> {
    if (n <= 0) {
      throw new RangeError(`invalid size ${n}`);
    }

    const data = new Array(n)
      .fill(null)
      .map((_, i) =>
        new Array(n).fill(null).map((_, j) => (i === j ? 1 : 0))
      ) as MatrixLike<N, N, number>;

    return new Matrix(data);
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

  transpose(): Matrix<N, M, D> {
    const data = [] as MatrixLike<N, M, D>;

    for (let j = 0; j < this.cols; j++) {
      let newRow = [] as Tuple<D, M>;

      for (let i = 0; i < this.rows; i++) {
        newRow.push(this.at(i, j)!);
      }

      data.push(newRow);
    }

    return new Matrix(data);
  }

  add<Other extends Matrix<M, N, D> | MatrixLike<M, N, D> | number[][]>(
    m: Other
  ) {
    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.cols || this.rows !== m.rows) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as MatrixLike<M, N, D>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          data[i][j] = (this.at(i, j)!.valueOf() +
            m.at(i, j)!.valueOf()) as unknown as D;
        }
      }

      return new Matrix(data);
    }

    if (Matrix.isMatrixLike<N, number, D>(m)) {
      // c is MatrixLike
      if (this.rows !== m.length || this.cols !== m[0].length) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols)) as MatrixLike<M, N, D>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          data[i][j] = (this.at(i, j)!.valueOf() +
            m[i][j].valueOf()) as unknown as D;
        }
      }

      return new Matrix(data);
    } else {
      throw new TypeError(`invalid argument ${m}`);
    }
  }

  sub<Other extends Matrix<M, N, D> | MatrixLike<M, N, D> | number[][]>(
    m: Other
  ) {
    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.cols || this.rows !== m.rows) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as MatrixLike<M, N, D>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          data[i][j] = (this.at(i, j)!.valueOf() -
            m.at(i, j)!.valueOf()) as unknown as D;
        }
      }

      return new Matrix(data);
    }

    if (Matrix.isMatrixLike<N, number, D>(m)) {
      // c is MatrixLike
      if (this.rows !== m.length || this.cols !== m[0].length) {
        throw new RangeError(
          `cannot add receiver [${this.rows}x${this.cols}] to argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols)) as MatrixLike<M, N, D>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          data[i][j] = (this.at(i, j)!.valueOf() -
            m[i][j].valueOf()) as unknown as D;
        }
      }

      return new Matrix(data);
    } else {
      throw new TypeError(`invalid argument ${m}`);
    }
  }

  mul<Other>(m: Other) {
    type Return = Other extends
      | Matrix<N, infer P, D>
      | MatrixLike<N, infer P, D>
      ? Matrix<M, P, D>
      : Other extends number[][]
      ? Matrix<number, number, number>
      : Other extends Number
      ? Matrix<M, N, D>
      : never;

    if (m instanceof Matrix) {
      // c is Matrix
      if (this.cols !== m.rows) {
        throw new RangeError(
          `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.rows}x${m.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m.cols)) as Tuple<D[], M>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < m.cols; j++) {
          data[i][j] = this.#data[i].reduce((acc, curr, n) => {
            const it = curr.valueOf() * m.at(n, j).valueOf();
            return acc + it;
          }, 0) as unknown as D;
        }
      }

      return new Matrix(data) as Return;
    }

    if (Matrix.isMatrixLike<N, number, D>(m)) {
      // c is MatrixLike
      if (this.cols !== m.length || m[0].length <= 0) {
        throw new RangeError(
          `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.length}x${m[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(m[0].length)) as Tuple<D[], M>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < m[0].length; j++) {
          data[i][j] = this.#data[i].reduce((acc, curr, n) => {
            const it = curr.valueOf() * m[n][j].valueOf();
            return acc + it;
          }, 0) as unknown as D;
        }
      }

      return new Matrix(data) as Return;
    } else if (Array.isArray(m)) {
      // c is malformed array
      throw new RangeError(
        `cannot multiply receiver [${this.rows}x${this.cols}] by argument [${m.length}x?]`
      );
    } else {
      // c is scalar
      return new Matrix<M, N, D>(
        this.#data.map((i) =>
          i.map((j) => j.valueOf() * (m as number).valueOf())
        ) as MatrixLike<M, N, D>
      ) as Return;
    }
  }

  pow<K extends number>(k: K): Matrix<M, M, number> {
    if (k < 0) {
      throw new RangeError("cannot raise to a negative power");
    }

    if (!this.isSquare()) {
      throw new Error("exponentiation is only defined for square matricies");
    }

    if (k === 0) {
      return Matrix.identity<M>(this.cols as M) as Matrix<M, M>;
    } else {
      let acc: Matrix<M, N, D> = this;
      for (let i = k - 1; i > 0; i--) {
        acc = acc.mul(this) as Matrix<M, N, D>;
      }

      return acc as unknown as Matrix<M, M, number>;
    }
  }
}
