export interface Add<In extends any[], Out = In[0]> {
  add(...addend: In): Out;
}

export interface Sub<In extends any[], Out = In[0]> {
  sub(...subtrahend: In): Out;
}

export interface Mul<In extends any[], Out = In[0]> {
  mul(...multiplicand: In): Out;
}

export interface Div<In extends any[], Out = In[0]> {
  div(...divisor: In): Out;
}

export interface Pow<In extends any[], Out = In[0]> {
  pow(...exponent: In): Out;
}

export interface Mod<In extends any[], Out = In[0]> {
  mod(...modulus: In): Out;
}

export interface Trig<Out> {
  sin(): Out;
  cos(): Out;
  tan(): Out;
}

export interface Abs<Out> {
  abs(): Out;
}

export interface Eq<Other extends any[]> {
  eq(...other: Other): boolean;
}

export interface Gt<Other extends any[]> {
  gt(...other: Other): boolean;
}

export interface Gte<Other extends any[]> {
  gte(...other: Other): boolean;
}

export interface Lt<Other extends any[]> {
  lt(...other: Other): boolean;
}

export interface Lte<Other extends any[]> {
  lte(...other: Other): boolean;
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
