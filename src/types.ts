export type Tuple<T, K extends number> = K extends K
  ? number extends K
    ? ReadonlyArray<T>
    : _TupleOf<T, K, []>
  : never;
type _TupleOf<T, K extends number, R extends unknown[]> = R["length"] extends K
  ? R
  : _TupleOf<T, K, [T, ...R]>;

export type Vec<K extends number> =
  | Tuple<number, K>
  | Readonly<Tuple<number, K>>;

export type MatrixLike<M extends number, N extends number> =
  | Tuple<Tuple<number, N>, M>
  | Readonly<Tuple<Tuple<number, N>, M>>;
