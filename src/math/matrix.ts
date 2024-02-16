import type { MatrixLike, Tuple } from "../types";

export type MatrixOperand<M extends number, N extends number> =
  | Matrix<M, N>
  | MatrixLike<M, N>
  | number[][];

export type SubmatrixOptions =
  | {
      removeRows: number[];
      removeCols: number[];
      xywh?: never;
    }
  | {
      xywh: [number, number] | [number, number, number, number];
      removeRows?: never;
      removeCols?: never;
    };

type MatrixResult<
  M extends number,
  N extends number,
  I extends MatrixOperand<number, number> | number,
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
 * simple numbers, but with plans to add support for complex numbers.
 *
 * Implements {@link Iterable} over {@link Tuple}
 */
export class Matrix<M extends number = number, N extends number = number>
  implements Iterable<Tuple<number, N>>
{
  #data: MatrixLike<M, N>;

  constructor(data: MatrixLike<M, N>) {
    this.#data = data;
  }

  get rows(): M {
    return this.#data.length as M;
  }

  get cols(): N {
    return this.#data[0].length as N;
  }

  get size() {
    return this.rows * this.cols;
  }

  get data(): MatrixLike<M, N> {
    return this.#data;
  }

  static zero<N extends number>(n: N): Matrix<N, N> {
    if (n <= 0) {
      throw new RangeError(`Invalid matrix size [${n}x${n}]`);
    }

    const data = new Array(n)
      .fill(null)
      .map(() => new Array(n).fill(0)) as MatrixLike<N, N>;

    return new Matrix<N, N>(data);
  }

  static identity<N extends number>(n: N): Matrix<N, N> {
    if (n <= 0) {
      throw new RangeError(`Invalid matrix size [${n}x${n}]`);
    }

    const m = Matrix.zero(n);
    for (let i = 0; i < n; i++) {
      (m.data[i][i] as number) = 1;
    }

    return m;
  }

  static withSize<M extends number, N extends number>(
    rows: M,
    cols: N,
    fillValue: number = 0
  ): Matrix<M, N> {
    if (rows <= 0 || cols <= 0) {
      throw new RangeError(`Invalid size [${rows} x ${cols}]`);
    }

    const data = new Array(rows)
      .fill(null)
      .map(() => new Array(cols).fill(fillValue)) as MatrixLike<M, N>;

    return new Matrix<M, N>(data);
  }

  static fromDiagonal<N extends number>(
    diagonal: Tuple<number, N> | number[]
  ): Matrix<N, N> {
    const d = diagonal.length as N;

    if (d <= 0) {
      throw new RangeError(`Invalid size [${d} x ${d}]`);
    }

    const m = Matrix.zero(d);
    for (let i = 0; i < d; i++) {
      (m.#data[i][i] as number) = diagonal[i];
    }

    return m;
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

    if (mm !== "%%matrixmarket") throw new Error(`Unrecognized header '${mm}'`);
    if (ob !== "matrix") throw new Error(`Unrecognized object '${ob}'`);

    // Validate variant selection
    if (!["coordinate", "array"].includes(format))
      throw new Error(`Unrecognized format '${format}'`);
    if (format === "array" && field === "pattern")
      throw new Error(
        `Format 'array' is incompatible with symmetry type 'pattern'`
      );
    if (options.format && format !== options.format)
      throw new Error(
        `Specified format '${options.format}' does not match data format '${format}'`
      );

    if (!["real", "complex", "integer", "pattern"].includes(field))
      throw new Error(`Unrecognized field type '${field}'`);
    if (
      (symmetry === "hermitian" && field !== "complex") ||
      (field === "pattern" && !["general", "symmetric"].includes(symmetry))
    )
      throw new Error(
        `Symmetry type '${symmetry}' is incompatible with field type '${field}'`
      );
    if (options.field && field !== options.field)
      throw new Error(
        `Specified field type '${options.field}' does not match data field type '${field}'`
      );

    if (
      !["general", "symmetric", "skew-symmetric", "hermitian"].includes(
        symmetry
      )
    )
      throw new Error(`Unrecognized symmetry type '${symmetry}'`);
    if (
      symmetry !== "general" ||
      (options.symmetry && symmetry !== options.symmetry)
    )
      throw new Error("Type");

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
        `Symmetry type '${symmetry}' is unsupported for non-square matrices`
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
        throw new Error(`Bad matrix coordinate ${i},${j}\n${line}`);

      if (Number.isNaN(v1)) throw new Error(`Bad value '${v1}`);
      if (Number.isNaN(v2)) throw new Error(`Bad value ${v2}`);

      let value = v1;
      switch (field) {
        case "integer": {
          if (!Number.isInteger(v1))
            throw new Error(`Non-integer value '${v1}'`);
          break;
        }
        case "complex": {
          if (Number.isNaN(v2)) {
            throw new Error(`Invalid imaginary component '${v2}'`);
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
    if (arg instanceof Matrix)
      return (
        !dimensions.length ||
        (arg.rows === dimensions[0] && arg.cols === dimensions[1])
      );

    const [m, n] = dimensions;

    return (
      Array.isArray(arg) &&
      Array.isArray(arg[0]) &&
      typeof arg[0][0]?.valueOf() === "number" &&
      ((!m && !n) || (arg.length === m && arg[0].length === n))
    );
  }

  isSquare(): boolean {
    return (this.rows as number) === this.cols;
  }

  isOrthogonal(): boolean {
    if (!this.isSquare()) return false;
    return this.transpose().mul(this).eq(Matrix.identity(this.cols));
  }

  at(i: number, j: number) {
    return this.#data.at(i)?.at(j);
  }

  row(i: number) {
    return this.data.at(i);
  }

  col(j: number) {
    if (j >= this.cols) return undefined;
    return this.data.map((row) => row.at(j)!) as Tuple<number, M>;
  }

  clone(): Matrix<M, N> {
    const data = this.#data.map((row) => [...row]) as MatrixLike<M, N>;
    return new Matrix<M, N>(data);
  }

  submatrix<M extends number, N extends number>({
    removeRows,
    removeCols,
    xywh,
  }: SubmatrixOptions) {
    if (!!xywh) {
      const [x, y, w, h] = xywh;
      const data = this.#data
        .slice(y, h ? h + y : h)
        .map((r) => r.slice(x, w ? w + x : w)) as MatrixLike<M, N>;
      return new Matrix<M, N>(data);
    } else {
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
  }

  trace(): number {
    if (!this.isSquare()) {
      throw new Error(
        `Cannot find trace of non-square matrix [${this.rows}x${this.cols}]`
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
        `Cannot find determinant of non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    if (this.size === 1) {
      return this.at(0, 0)!;
    }

    // FIXME: this code is slow -- better algo?

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
      const sub = this.submatrix({ removeRows: [0], removeCols: [i] });
      const sign = (-1) ** (i % 2);
      const subdeterminant = sub.determinant();

      if (subdeterminant === undefined) {
        throw new Error(`Failed to find subdeterminant`);
      }

      total += this.at(0, i)! * sign * subdeterminant;
    }

    return total;
  }

  augment<O extends number, P extends number>(
    other: MatrixOperand<M, O>
  ): Matrix<M, P> {
    const otherMatrix =
      other instanceof Matrix
        ? other
        : Matrix.isMatrixLike<M, O>(other)
        ? new Matrix<M, O>(other)
        : null;

    if (!otherMatrix) {
      throw new Error("Argument is not matrix-like.");
    }

    if (otherMatrix.rows !== this.rows) {
      throw new Error(
        `Cannot augment matrix [${this.rows}x${this.cols}] by [${otherMatrix.rows}x${otherMatrix.cols}]`
      );
    }

    const newData = this.#data.map((row, i) => row.concat(otherMatrix.row(i)!));
    return new Matrix(newData as MatrixLike<M, P>);
  }

  inverse(tolerance: number = 5): Matrix<M, M> | undefined {
    if (!this.isSquare()) {
      throw new Error(
        `Cannot invert non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    if (!this.determinant()) {
      throw new Error(`Cannot invert singular matrix`);
    }

    // Gauss-Jordan elimination:
    // https://en.wikipedia.org/wiki/Gaussian_elimination#Finding_the_inverse_of_a_matrix
    const aug = this.augment(Matrix.identity(this.rows)).data as number[][];

    // Convert to Reduced Row Echelon Form
    aug.forEach((pivotRow, i) => {
      // Get pivot point
      const pivot = pivotRow[i];
      if (pivot === 0) return;

      // Reduce leading zeros of other rows
      aug.forEach((row, j) => {
        if (j === i) return;
        if (row[i] === 0) return;

        // Find factor
        const factor = -1 * (row[i] / pivot);

        // Distribute
        aug[j] = row.map((value, idx) => value + factor * pivotRow[idx]);
      });
    });

    // Reduce coefficients
    aug.forEach((row, i) => {
      if (row[i] === 1) return;
      const recip = row[i] === 0 ? 1 : 1 / row[i];
      aug[i] = row.map((value) => value * recip);
    });

    // Extract result matrix
    const possibleInverse = new Matrix<M, N>(aug as MatrixLike<M, N>).submatrix<
      M,
      M
    >({ xywh: [this.cols, 0, this.cols, this.rows] });

    // Check inverse
    if (this.mul(possibleInverse).eq(Matrix.identity(this.rows), tolerance)) {
      return possibleInverse;
    } else {
      return;
    }
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

  add(other: MatrixOperand<M, N>): Matrix<M, N> {
    if (other instanceof Matrix) {
      // c is Matrix
      if (this.cols !== other.cols || this.rows !== other.rows) {
        throw new RangeError(
          `Cannot add receiver [${this.rows}x${this.cols}] to argument [${other.rows}x${other.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(other.cols));

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! + other.at(i, j)!;
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else if (Matrix.isMatrixLike(other)) {
      // c is MatrixLike
      if (this.rows !== other.length || this.cols !== other[0].length) {
        throw new RangeError(
          `Cannot add receiver [${this.rows}x${this.cols}] to argument [${other.length}x${other[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols));

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! + other[i][j];
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else {
      throw new TypeError(`Invalid argument ${other}`);
    }
  }

  sub(other: MatrixOperand<M, N>): Matrix<M, N> {
    if (other instanceof Matrix) {
      // c is Matrix
      if (this.cols !== other.cols || this.rows !== other.rows) {
        throw new RangeError(
          `Cannot subtract from receiver [${this.rows}x${this.cols}] argument [${other.rows}x${other.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(other.cols));

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! - other.at(i, j)!;
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else if (Matrix.isMatrixLike(other)) {
      // c is MatrixLike
      if (this.rows !== other.length || this.cols !== other[0].length) {
        throw new RangeError(
          `Cannot subtract from receiver [${this.rows}x${this.cols}] argument [${other.length}x${other[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(this.cols));

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          (data[i][j] as number) = this.at(i, j)! - other[i][j];
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else {
      throw new TypeError(`Invalid argument ${other}`);
    }
  }

  mul<I extends MatrixOperand<number, number> | number>(
    other: I
  ): MatrixResult<M, N, I> {
    if (other instanceof Matrix) {
      // c is Matrix
      if ((this.cols as number) !== other.rows) {
        throw new RangeError(
          `Cannot multiply receiver [${this.rows}x${this.cols}] by argument [${other.rows}x${other.cols}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(other.cols)) as MatrixLike<M, number>;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < other.cols; j++) {
          (data[i][j] as number) = this.#data[i].reduce((acc, curr, n) => {
            const it = curr * other.at(n, j)!;
            return acc + it;
          }, 0);
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else if (Matrix.isMatrixLike(other)) {
      // c is MatrixLike
      if (this.cols !== other.length || other[0].length <= 0) {
        throw new RangeError(
          `Cannot multiply receiver [${this.rows}x${this.cols}] by argument [${other.length}x${other[0].length}]`
        );
      }

      const data = new Array(this.rows)
        .fill(null)
        .map(() => new Array(other[0].length));

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < other[0].length; j++) {
          (data[i][j] as number) = this.#data[i].reduce((acc, curr, n) => {
            const it = curr * other[n][j];
            return acc + it;
          }, 0);
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else if (Array.isArray(other)) {
      // c is malformed array
      throw new RangeError(
        `Cannot multiply receiver [${this.rows}x${this.cols}] by argument [${other.length}x?]`
      );
    } else {
      // c is scalar
      // @ts-ignore
      return new Matrix<M, N>(
        this.#data.map((i) =>
          i.map((j) => j * (other as number))
        ) as MatrixLike<M, N>
      );
    }
  }

  pow(k: number): Matrix<M, M> {
    if (k < 0) {
      throw new RangeError(
        "Negative exponentiation is not permitted. If matrix is invertible, first invert then use positive exponentiation."
      );
    }

    if (!this.isSquare()) {
      throw new Error("Exponentiation is only defined for square matricies");
    }

    if (k === 0) {
      return Matrix.identity<M>(this.rows);
    } else {
      let acc = this as any;
      for (let i = k - 1; i > 0; i--) {
        acc = acc.mul(this);
      }

      return acc;
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
    } else if (Matrix.isMatrixLike(other, this.rows, this.cols)) {
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

  dot(other: MatrixOperand<M, 1>): number {
    if (this.cols !== 1 || !Matrix.isMatrixLike(other)) {
      throw new Error(
        `Cannot compute dot product of non column-vector matrices.`
      );
    }

    return (this.transpose() as Matrix<1, M>).mul(other).at(0, 0)!;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
}
