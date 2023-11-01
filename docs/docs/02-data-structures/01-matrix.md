# Matrix

A concrete Matrix class for simple linear algebra, currently only supporting simple numbers, but with plans to add support for complex numbers.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Matrix<M extends number, N extends number>
  implements Iterable<Tuple<number, N>>
{
  constructor(data: MatrixLike<M, N>);

  static zero<N extends number>(n: N): Matrix<N, N>;
  static identity<N extends number>(n: N): Matrix<N, N>;
  static withSize<M extends number, N extends number>(
    rows: M,
    cols: N,
    fillValue?: number
  ): Matrix<M, N>;
  static fromDiagonal<N extends number>(
    diagonal: Tuple<number, N> | number[]
  ): Matrix<N, N>;
  static fromMTX<M extends number, N extends number>(
    data: string,
    options?: MTXOptions
  ): Matrix<M, N>;
  static isMatrixLike<M extends number, N extends number>(
    arg: unknown,
    ...dimensions: [m: M, n: N] | []
  ): arg is MatrixLike<M, N>;

  get rows(): M;
  get cols(): N;
  get size(): number;
  get data(): MatrixLike<M, N>;

  isSquare(): boolean;
  isOrthogonal(): boolean;

  at(i: number, j: number): number | undefined;
  row(i: number): Tuple<number, N> | undefined;
  col(j: number): Tuple<number, M> | undefined;
  clone(): Matrix<M, N>;
  submatrix<M extends number, N extends number>(
    options: SubmatrixOptions
  ): Matrix<number, number>;
  augment<O extends number, P extends number>(
    other: MatrixOperand<M, O>
  ): Matrix<M, P>;

  trace(): number;
  determinant(): number | undefined;
  inverse(tolerance?: number): Matrix<M, M> | undefined;
  transpose(): Matrix<N, M>;

  add(other: MatrixOperand<M, N>): Matrix<M, N>;
  sub(other: MatrixOperand<M, N>): Matrix<M, N>;
  mul<I extends MatrixOperand<number, number> | number>(
    other: I
  ): MatrixResult<M, N, I>;
  pow(k: number): Matrix<M, M>;
  eq(other: MatrixOperand<M, N>, tolerance?: number): boolean;
  dot(other: MatrixOperand<M, 1>): number;

  [Symbol.iterator](): Iterator<Vec<N>>;
}
```

  </p>
</details>

```ts
import { Matrix } from "kdim";

const mtx = new Matrix<3, 3>([
  [5, 2, 10],
  [-1, 7, 7],
  [3, -3, 9],
]);

mtx.rows; // 3
mtx.cols; // 3
mtx.col(2); // [10, 7, 9]
mtx.mul(2);
// [
//   [10, 4, 20],
//   [-2, 14, 14],
//   [6, -6, 18],
// ]

mtx.mul(Matrix.identity(3)).eq(mtx); // true
```
