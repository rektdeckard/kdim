export abstract class Bounded {
  abstract get value(): number;
  abstract get min(): number;
  abstract get max(): number;
}

export type BoundedOptions = {
  max: number;
  min?: number;
};
