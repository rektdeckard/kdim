export interface Add<In, Out = In> {
  add(addend: In): Out;
}

export interface Sub<In, Out = In> {
  sub(subtrahend: In): Out;
}

export interface Mul<In, Out = In> {
  mul(multiplicand: In): Out;
}

export interface Div<In, Out = In> {
  div(divisor: In): Out;
}

export interface Pow<In, Out = In> {
  pow(exponent: In): Out;
}

export interface Eq<Other> {
  eq(other: Other): boolean;
}

export abstract class Bounded {
  abstract get value(): number;
  abstract get min(): number;
  abstract get max(): number;
}

export type BoundedOptions = {
  max: number;
  min?: number;
};
