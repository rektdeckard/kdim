import { Complex } from "./complex";
import { Rational } from "./rational";
import type { Tuple } from "../types";

export type MatrixLike<
  M extends number,
  N extends number,
  T extends Complex | Rational = Rational,
> = Tuple<Tuple<number | T, N>, M> | Readonly<Tuple<Tuple<number | T, N>, M>>;

export type MatrixData<M extends number, N extends number> = Readonly<
  Tuple<Tuple<number, N>, M>
>;

export type MatrixOperand<
  M extends number,
  N extends number,
  T extends Complex | Rational,
> = Matrix<M, N, T> | MatrixLike<M, N, T> | number[][];

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
  I extends MatrixOperand<number, number, T> | number,
  T extends Complex | Rational,
> = I extends number
  ? Matrix<M, N, T>
  : I extends MatrixOperand<infer O, infer P, infer T>
  ? N extends O
    ? Matrix<M, P, T>
    : never
  : never;

export type MTXOptions = {
  format?: "coordinate" | "array";
  field?: "real" | "complex" | "integer" | "pattern";
  symmetry?: "general" | "symmetric" | "skew-symmetric" | "hermitian";
};

/**
 * A concrete Matrix class for simple linear algebra, supporting both Rational
 * and Complex number types.
 *
 * Implements {@link Iterable} over {@link Tuple} of number
 */
export class Matrix<
  M extends number,
  N extends number,
  T extends Complex | Rational = Rational,
> implements Iterable<Tuple<number, N>>
{
  #type: typeof Complex | typeof Rational;
  #data: Tuple<Tuple<T, N>, M>;

  constructor(
    data: MatrixLike<M, N, T>,
    type?: T extends Rational ? "rational" : "complex"
  ) {
    this.#type = type === "complex" ? Complex : Rational;
    this.#data = data.map((row) =>
      row.map((col) => {
        return typeof col === "number"
          ? new this.#type(col)
          : (this.#assertType(col), col);
      })
    ) as Tuple<Tuple<T, N>, M>;
  }

  #assertType(value: number | T) {
    if (!(value instanceof this.#type)) {
      throw new Error(`Expected ${this.#type}, found ${typeof value}`);
    }
  }

  #coerceType(value: number | T): T {
    if (value instanceof this.#type) {
      return value;
    }

    if (typeof value === "number") {
      return this.#type.from(value) as T;
    }

    throw new Error(`Expected ${this.#type}, found ${typeof value}`);
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

  get type(): "rational" | "complex" {
    return this.#type === Complex ? "complex" : "rational";
  }

  static zero<N extends number, T extends "rational" | "complex">(
    n: N,
    type?: T
  ): Matrix<N, N, T extends "complex" ? Complex : Rational> {
    if (n <= 0) {
      throw new RangeError(`Invalid matrix size [${n}x${n}]`);
    }

    const ty = type === "complex" ? Complex : Rational;
    const data = new Array(n)
      .fill(null)
      .map(() => new Array(n).fill(new ty(0))) as MatrixLike<
      N,
      N,
      T extends "complex" ? Complex : Rational
    >;

    return new Matrix<N, N, T extends "complex" ? Complex : Rational>(data);
  }

  static identity<N extends number, T extends "rational" | "complex">(
    n: N,
    type?: T
  ): Matrix<N, N, T extends "complex" ? Complex : Rational> {
    if (n <= 0) {
      throw new RangeError(`Invalid matrix size [${n}x${n}]`);
    }

    const ty = type === "complex" ? Complex : Rational;
    const m = Matrix.zero(n, type);
    for (let i = 0; i < n; i++) {
      (m.#data[i][i] as any) = new ty(1);
    }

    return m;
  }

  static withSize<
    M extends number,
    N extends number,
    T extends "rational" | "complex",
  >(
    rows: M,
    cols: N,
    fillValue: number = 0,
    type?: T
  ): Matrix<M, N, T extends "complex" ? Complex : Rational> {
    if (rows <= 0 || cols <= 0) {
      throw new RangeError(`Invalid size [${rows} x ${cols}]`);
    }

    const ty = type === "complex" ? Complex : Rational;
    const data = new Array(rows)
      .fill(null)
      .map(() => new Array(cols).fill(new ty(fillValue))) as MatrixLike<
      M,
      N,
      T extends "complex" ? Complex : Rational
    >;

    return new Matrix(data);
  }

  static fromDiagonal<N extends number, T extends "rational" | "complex">(
    diagonal: Tuple<number | T, N> | number[],
    type?: T
  ): Matrix<N, N, T extends "complex" ? Complex : Rational> {
    const d = diagonal.length as N;

    if (d <= 0) {
      throw new RangeError(`Invalid size [${d} x ${d}]`);
    }

    const ty = type === "complex" ? Complex : Rational;
    const m = Matrix.zero(d, type);
    for (let i = 0; i < d; i++) {
      (m.#data[i][i] as any) = ty.from(diagonal[i] as any);
    }

    return m;
  }

  static fromMTX<M extends number, N extends number>(
    data: string,
    options: MTXOptions = {}
  ): Matrix<M, N, Rational> {
    // TODO: implement Complex number parsing here

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

    const matrix = Matrix.withSize<M, N, "rational">(rows as M, columns as N);

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

      (matrix.#data[i - 1][j - 1] as Rational) = new Rational(value);
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

  data() {
    return this.#data.map((row) =>
      row.map((col) => col.valueOf())
    ) as unknown as MatrixData<M, N>;
  }

  underlying(): Readonly<Tuple<Tuple<T, N>, M>> {
    return this.#data;
  }

  at(i: number, j: number) {
    return this.#data.at(i)?.at(j)?.valueOf();
  }

  row(i: number): Readonly<Tuple<number, N>> | undefined {
    return this.data()
      .at(i)
      ?.map((col) => col.valueOf()) as Tuple<number, N> | undefined;
  }

  col(j: number): Readonly<Tuple<number, M>> | undefined {
    if (j >= this.cols) return undefined;
    return this.#data.map((row) => row.at(j)!.valueOf()) as Tuple<number, M>;
  }

  clone(): Matrix<M, N, T> {
    const data = this.#data.map((row) => [...row]) as MatrixLike<M, N, T>;
    return new Matrix<M, N, T>(data);
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
        .map((r) => r.slice(x, w ? w + x : w)) as MatrixLike<M, N, T>;
      return new Matrix<M, N, T>(data);
    } else {
      const data = this.#data.reduce<T[][]>((data, row, i) => {
        if (!removeRows.includes(i)) {
          const newRow = row.reduce<T[]>((curr, col, j) => {
            if (!removeCols.includes(j)) {
              curr.push(col);
            }
            return curr;
          }, []);
          data.push(newRow);
        }
        return data;
      }, []) as MatrixLike<M, N, T>;

      return new Matrix<M, N, T>(data);
    }
  }

  trace(): T {
    if (!this.isSquare()) {
      throw new Error(
        `Cannot find trace of non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    let total: T = new this.#type(0) as T;
    for (let i = 0; i < this.rows; i++) {
      total = (total as Rational).add(this.#data[i][i] as Rational) as T;
    }

    return total;
  }

  determinant(): T | undefined {
    if (!this.isSquare()) {
      throw new Error(
        `Cannot find determinant of non-square matrix [${this.rows}x${this.cols}]`
      );
    }

    if (this.size === 1) {
      return this.#data[0][0]!;
    }

    // FIXME: this code is slow -- better algo?

    if (this.rows === 2 && this.cols === 2) {
      // 2 x 2 fast path
      return (this.#data[0][0] as Rational)
        .mul(this.#data[1][1] as Rational)
        .sub(
          (this.#data[1][0] as Rational).mul(this.#data[0][1] as Rational)
        ) as T;
    }

    if (this.rows === 3 && this.cols === 3) {
      // 3 x 3 Rule of Sarrus fast path
      // det(A) = aei + bfg + cdh - ceg - bdi - afh
      return (this.#data[0][0] as Rational)
        .mul(this.#data[1][1] as Rational)
        .mul(this.#data[2][2] as Rational)
        .add(
          (this.#data[0][1] as Rational)
            .mul(this.#data[1][2] as Rational)
            .mul(this.#data[2][0] as Rational)
        )
        .add(
          (this.#data[0][2] as Rational)
            .mul(this.#data[1][0] as Rational)
            .mul(this.#data[2][1] as Rational)
        )
        .sub(
          (this.#data[0][2] as Rational)
            .mul(this.#data[1][1] as Rational)
            .mul(this.#data[2][0] as Rational)
        )
        .sub(
          (this.#data[0][1] as Rational)
            .mul(this.#data[1][0] as Rational)
            .mul(this.#data[2][2] as Rational)
        )
        .sub(
          (this.#data[0][0] as Rational)
            .mul(this.#data[1][2] as Rational)
            .mul(this.#data[2][1] as Rational)
        ) as T;
    }

    let total = new this.#type(0);
    for (let i = 0; i < this.rows; i++) {
      const sub = this.submatrix({ removeRows: [0], removeCols: [i] });
      const sign = new this.#type((-1) ** (i % 2));
      const subdeterminant = sub.determinant();

      if (subdeterminant === undefined) {
        throw new Error(`Failed to find subdeterminant`);
      }

      total = (total as Rational).add(
        (this.#data[0][i] as Rational)
          .mul(sign as Rational)
          .mul(subdeterminant as Rational)
      );
    }

    return total as T;
  }

  augment<O extends number, P extends number>(
    other: MatrixOperand<M, O, T>
  ): Matrix<M, P, T> {
    const otherMatrix =
      other instanceof Matrix
        ? other
        : Matrix.isMatrixLike(other)
        ? new Matrix<M, O>(other as MatrixLike<M, O>)
        : null;

    if (!otherMatrix) {
      throw new Error("Argument is not matrix-like.");
    }

    if (otherMatrix.rows !== this.rows) {
      throw new Error(
        `Cannot augment matrix [${this.rows}x${this.cols}] by [${otherMatrix.rows}x${otherMatrix.cols}]`
      );
    }

    const newData = this.#data.map((row, i) =>
      row.concat(otherMatrix.#data[i] as T[])
    );
    return new Matrix(newData as MatrixLike<M, P, T>);
  }

  inverse(tolerance: number = 5): Matrix<M, M, T> | undefined {
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
    const aug = this.augment(
      Matrix.identity(this.rows, this.type) as Matrix<M, M, T>
    ).underlying();

    // Convert to Reduced Row Echelon Form
    aug.forEach((pivotRow, i) => {
      // Get pivot point
      const pivot = pivotRow[i];
      if (pivot.eq(0)) return;

      // Reduce leading zeros of other rows
      aug.forEach((row, j) => {
        if (j === i) return;
        if (row[i].eq(0)) return;

        // Find factor
        const factor = new this.#type(-1).mul(
          (row[i] as Rational).div(pivot as Rational)
        );

        // Distribute
        (aug[j] as any) = row.map((value, idx) =>
          (value as Rational).add(
            (factor as Rational).mul(pivotRow[idx] as Rational)
          )
        );
      });
    });

    // Reduce coefficients
    aug.forEach((row, i) => {
      if (row[i].eq(1)) return;
      const recip = row[i].eq(0)
        ? new this.#type(1)
        : new this.#type(1).div(row[i] as any);
      (aug[i] as any) = row.map((value) => value.mul(recip as any));
    });

    // Extract result matrix
    const possibleInverse = new Matrix<M, N, T>(
      aug as MatrixLike<M, N, T>
    ).submatrix<M, M>({ xywh: [this.cols, 0, this.cols, this.rows] });

    // Check inverse
    if (
      this.mul(possibleInverse as any).eq(
        Matrix.identity(this.rows, this.type),
        tolerance
      )
    ) {
      return possibleInverse;
    } else {
      return;
    }
  }

  transpose(): Matrix<N, M, T> {
    const m = Matrix.withSize(
      this.cols as N,
      this.rows as M,
      0,
      this.type
    ) as Matrix<N, M, T>;

    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.rows; i++) {
        (m.#data[j][i] as any) = this.#data[i][j];
      }
    }

    return m;
  }

  vectorize(): number[] {
    return this.data().flat() as number[];
  }

  add(other: MatrixOperand<M, N, T>): Matrix<M, N, T> {
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
          this.#assertType(other.#data[i][j]);
          (data[i][j] as any) = this.#data[i][j].add(other.#data[i][j] as any);
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
          (data[i][j] as any) = this.#data[i][j].add(other[i][j]);
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else {
      throw new TypeError(`Invalid argument ${other}`);
    }
  }

  sub(other: MatrixOperand<M, N, T>): Matrix<M, N, T> {
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
          this.#assertType(other.#data[i][j]);
          (data[i][j] as any) = this.#data[i][j].sub(other.#data[i][j] as any);
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
          (data[i][j] as any) = this.#data[i][j].sub(
            this.#coerceType(other[i][j]) as any
          );
        }
      }

      // @ts-ignore
      return new Matrix(data);
    } else {
      throw new TypeError(`Invalid argument ${other}`);
    }
  }

  mul<I extends MatrixOperand<number, number, T> | number>(
    other: I
  ): MatrixResult<M, N, I, T> {
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
          (data[i][j] as any) = this.#data[i].reduce((acc, curr, n) => {
            this.#assertType(other.#data[n][j]);
            const it = curr.mul(other.#data[n][j] as any);
            return acc.add(it as any);
          }, new this.#type(0));
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
          (data[i][j] as any) = this.#data[i].reduce((acc, curr, n) => {
            const it = curr.mul(this.#coerceType(other[n][j]) as any);
            return acc.add(it as any);
          }, new this.#type(0));
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
      return new Matrix<M, N, T>(
        this.#data.map((i) =>
          i.map((j) => j.mul(other as number))
        ) as MatrixLike<M, N, T>
      );
    }
  }

  pow(k: number): Matrix<M, M, T> {
    if (k < 0) {
      throw new RangeError(
        "Negative exponentiation is not permitted. If matrix is invertible, first invert then use positive exponentiation."
      );
    }

    if (!this.isSquare()) {
      throw new Error("Exponentiation is only defined for square matricies");
    }

    if (k === 0) {
      return Matrix.identity(this.rows, this.type) as Matrix<M, M, T>;
    } else {
      let acc = this as any;
      for (let i = k - 1; i > 0; i--) {
        acc = acc.mul(this);
      }

      return acc;
    }
  }

  eq(other: MatrixOperand<M, N, T>, tolerance: number = 5): boolean {
    function closeEnough(a: number, b: number): boolean {
      if (!tolerance) return a === b;
      return Math.abs(a - b) < 1 / 10 ** tolerance;
    }

    if (other instanceof Matrix) {
      // o is Matrix
      if (!Matrix.isMatrixLike(other.data(), this.rows, this.cols))
        return false;
      // @ts-ignore
      return other
        .underlying()
        .every((row, i) =>
          row.every((col, j) => this.#data[i][j].eq(col as any))
        );
    } else if (Matrix.isMatrixLike(other, this.rows, this.cols)) {
      // o is MatrixLike
      // Hack to access array methods on underlying tuples
      // @ts-ignore
      return other.every((row, i) =>
        // @ts-ignore
        row.every((col, j) => this.#data[i][j].eq(col))
      );
    }

    return false;
  }

  dot(other: MatrixOperand<M, 1, T>): T {
    if (this.cols !== 1 || !Matrix.isMatrixLike(other)) {
      throw new Error(
        `Cannot compute dot product of non column-vector matrices.`
      );
    }

    return (this.transpose() as unknown as Matrix<1, M, T>).mul(other)
      .#data[0][0] as T;
  }

  [Symbol.iterator]() {
    return this.data()[Symbol.iterator]();
  }
}
