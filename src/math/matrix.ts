import { MatrixLike, Vec } from "../types";

export type MatrixOperand<M extends number, N extends number> =
  | Matrix<M, N>
  | MatrixLike<M, N>
  | number[][];

type MatrixResult<
  M extends number,
  N extends number,
  I extends MatrixOperand<number, number> | number
> = I extends number
  ? Matrix<M, N>
  : I extends MatrixOperand<infer O, infer P>
  ? N extends O
    ? Matrix<M, P>
    : never
  : never;

export type MTXOptions = {
  format?: "coordinate" | "array";
  field?: "real" | "complex" | "integer" | "pattern";
  symmetry?: "general" | "symmetric" | "skew-symmetric" | "hermitian";
};

/**
 * A concrete Matrix class for simple linear algebra, currently only supporting
 * simple numbers, but with plans to add supoprt for complex numbers.
 *
 * Implements {@link Iterable} over {@link Vec}
 */
export class Matrix<M extends number, N extends number>
  implements Iterable<Vec<N>>
{
  #data: MatrixLike<M, N>;

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

  get data(): MatrixLike<M, N> {
    return this.#data;
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

  static fromMTX<M extends number, N extends number>(
    data: string,
    options: MTXOptions = {}
  ): Matrix<M, N> {
    // Parse headers
    const [header, ...lines] = data.split(/\n/);
    const [mm, ob, format, field, symmetry] = header
      .split(/\s+/)
      .map((i) => i.toLowerCase());

    if (mm !== "%%matrixmarket") throw new Error(`unrecognized header '${mm}'`);
    if (ob !== "matrix") throw new Error(`unrecognized object '${ob}'`);

    // Validate variant selection
    if (!["coordinate", "array"].includes(format))
      throw new Error(`unrecognized format '${format}'`);
    if (format === "array" && field === "pattern")
      throw new Error(
        `format 'array' is incompatible with symmetry type 'pattern'`
      );
    if (options.format && format !== options.format)
      throw new Error(
        `specified format '${options.format}' does not match data format '${format}'`
      );

    if (!["real", "complex", "integer", "pattern"].includes(field))
      throw new Error(`unrecognized field type '${field}'`);
    if (
      (symmetry === "hermitian" && field !== "complex") ||
      (field === "pattern" && !["general", "symmetric"].includes(symmetry))
    )
      throw new Error(
        `symmetry type '${symmetry}' is incompatible with field type '${field}'`
      );
    if (options.field && field !== options.field)
      throw new Error(
        `specified field type '${options.field}' does not match data field type '${field}'`
      );

    if (
      !["general", "symmetric", "skew-symmetric", "hermitian"].includes(
        symmetry
      )
    )
      throw new Error(`unrecognized symmetry type '${symmetry}'`);
    if (
      symmetry !== "general" ||
      (options.symmetry && symmetry !== options.symmetry)
    )
      throw new Error("type");

    // Skip leading comments
    while (lines[0].startsWith("%")) {
      lines.shift();
    }

    // Parse dimensions
    const [rows, columns, _entries] = lines
      .shift()!
      .split(/\s/)
      .map((v) => parseInt(v));

    if (rows !== columns && symmetry !== "general")
      throw new Error(
        `symmetry type '${symmetry}' is unsupported for non-square matrices`
      );

    const matrix = Matrix.withSize(rows as M, columns as N);

    // Parse data
    for (let n = 0, o = 0; n < lines.length; n++) {
      const line = lines[n];
      if (line.startsWith("%")) continue;
      if (!line.trim()) continue;

      let [i, j, v1, v2] = line.split(/\s+/).map(Number);
      if (format === "array") {
        v1 = i;
        v2 = j;
        [i, j] = [(o % rows) + 1, Math.floor(o / rows) + 1];
        o++;
      }

      if (!Number.isInteger(i) || !Number.isInteger(j))
        throw new Error(`bad matrix coordinate ${i},${j}\n${line}`);

      if (Number.isNaN(v1)) throw new Error("bad value");
      if (Number.isNaN(v2)) throw new Error("bad value");

      let value = v1;
      switch (field) {
        case "integer": {
          if (!Number.isInteger(v1))
            throw new Error(`non-integer value '${v1}'`);
          break;
        }
        case "complex": {
          if (Number.isNaN(v2)) {
            throw new Error(`invalid imaginary component '${v2}'`);
          }
          throw new Error(`TODO`);
          break;
        }
        case "pattern": {
          throw new Error(`TODO`);
          break;
        }
      }

      (matrix.#data[i - 1][j - 1] as number) = value;
    }

    return matrix;
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

  isSquare(): boolean {
    return this.rows === this.cols;
  }

  at(i: number, j: number) {
    return this.#data.at(i)?.at(j);
  }

  clone(): Matrix<M, N> {
    const data = this.#data.map((row) => [...row]) as MatrixLike<M, N>;
    return new Matrix(data);
  }

  submatrix<M extends number, N extends number>(
    removeRows: number[],
    removeCols: number[]
  ) {
    const data = this.#data.reduce<number[][]>((data, row, i) => {
      if (!removeRows.includes(i)) {
        const newRow = row.reduce<number[]>((curr, col, j) => {
          if (!removeCols.includes(j)) {
            curr.push(col);
          }
          return curr;
        }, []);
        data.push(newRow);
      }
      return data;
    }, []) as MatrixLike<M, N>;

    return new Matrix<M, N>(data);
  }

  trace(): number {
    if (!this.isSquare()) {
      throw new Error(
        `cannot find trace of non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    let total = 0;
    for (let i = 0; i < this.rows; i++) {
      total += this.data[i][i];
    }

    return total;
  }

  determinant(): number | undefined {
    if (!this.isSquare()) {
      throw new Error(
        `cannot find determinant of non-square matrix [${this.rows}x${this.cols}]`
      );
    }

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

    let total = 0;
    for (let i = 0; i < this.rows; i++) {
      const sub = this.submatrix([0], [i]);
      const sign = (-1) ** (i % 2);
      const subdeterminant = sub.determinant();

      if (subdeterminant === undefined) {
        throw new Error(`failed to find subdeterminant`);
      }

      total += this.at(0, i)! * sign * subdeterminant;
    }

    return total;
  }

  inverse(tolerance: number = 5): Matrix<M, M> | undefined {
    if (!this.isSquare()) {
      throw new Error(
        `cannot invert non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    if (!this.determinant()) {
      throw new Error(`cannot invert singular matrix`);
    }

    const am = this.clone();
    const im = Matrix.identity<M>(am.rows as M);

    for (let fd = 0; fd < am.rows; fd++) {
      const fdScaler = 1.0 / am.at(fd, fd)!;

      for (let j = 0; j < am.cols; j++) {
        (am.#data[fd][j] as number) *= fdScaler;
        (im.#data[fd][j] as number) *= fdScaler;
      }

      for (let i = 0; i < am.rows; i++) {
        if (i === fd) continue;

        const rowScaler = am.at(i, fd)!;
        for (let j = 0; j < am.cols; j++) {
          (am.#data[i][j] as number) = am.at(i, j)! - rowScaler * am.at(fd, j)!;
          (im.#data[i][j] as number) = im.at(i, j)! - rowScaler * im.at(fd, j)!;
        }
      }
    }

    if (!Matrix.identity(this.rows).eq(this.mul(im), tolerance)) {
      throw new Error(`matrix inversion failed!`);
    }

    return im;
  }

  transpose(): Matrix<N, M> {
    const m = Matrix.withSize<N, M>(this.cols as N, this.rows as M);

    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.rows; i++) {
        (m.#data[j][i] as number) = this.#data[i][j];
      }
    }

    return m;
  }

  vectorize(): number[] {
    return (this.#data as number[][]).flat();
  }

  add(m: MatrixOperand<M, N>) {
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

  sub(m: MatrixOperand<M, N>) {
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

  mul<I extends MatrixOperand<number, number> | number>(
    m: I
  ): MatrixResult<M, N, I> {
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
      return new Matrix(data) as MatrixResult<M, N, I>;
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

      return new Matrix(data) as MatrixResult<M, N, I>;
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
      ) as MatrixResult<M, N, I>;
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

  eq(other: MatrixOperand<M, N>, tolerance: number = 5): boolean {
    function closeEnough(a: number, b: number): boolean {
      if (!tolerance) return a === b;
      return Math.abs(a - b) < 1 / 10 ** tolerance;
    }

    if (other instanceof Matrix) {
      // o is Matrix
      if (!Matrix.isMatrixLike(other.data, this.rows, this.cols)) return false;
      // @ts-ignore
      return other.data.every((row, i) =>
        row.every((col, j) => closeEnough(col, this.at(i, j)!))
      );
    }

    if (Matrix.isMatrixLike(other, this.rows, this.cols)) {
      // o is MatrixLike
      // Hack to access array methods on underlying tuples
      // @ts-ignore
      return other.every((row, i) =>
        // @ts-ignore
        row.every((col, j) => closeEnough(col, this.at(i, j)!))
      );
    }

    return false;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
}
