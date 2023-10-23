import { describe, it, expect } from "vitest";
import { clamp, lerp, factorial } from "../../src/math";

describe("clamp()", () => {
  it("clamps value in simple range", () => {
    const [min, max] = [20, 50];
    expect(clamp(min, max, 100)).toBe(50);
  });

  it("clamps value in range crossing zero", () => {
    const [min, max] = [-99, 99];
    expect(clamp(min, max, -1000)).toBe(-99);
  });

  it("leaves values in range as-is", () => {
    const [min, max] = [0, 1];
    const val = 0.234;
    expect(clamp(min, max, val)).toBe(val);
  });

  it("throws with invalid range", () => {
    const [min, max] = [1, 0];
    expect(() => clamp(min, max, 0.25)).toThrow(RangeError);
  });
});

describe("lerp()", () => {
  it("interpolates value in simple range", () => {
    const [min, max] = [20, 50];
    expect(lerp(min, max, 0.5)).toBe(35);
  });

  it("interpolates value in range crossing zero", () => {
    const [min, max] = [-99, 99];
    expect(lerp(min, max, 0.25)).toBe(-49.5);
  });

  it("interpolates value in nagative range", () => {
    const [min, max] = [100, 0];
    expect(lerp(min, max, 0.01)).toBe(99);
  });

  it("throws with value outside range", () => {
    const [min, max] = [0, 42];
    expect(() => lerp(min, max, -1)).toThrow(RangeError);
  });
});

describe("factorial()", () => {
  it("returns simple short-path factorials", () => {
    expect(factorial(1)).toBe(1);
    expect(factorial(2)).toBe(2);
  });

  it("returns larger factorials", () => {
    expect(factorial(7)).toBe(5040);
    expect(factorial(18)).toBe(6402373705728000);
  });

  it("throws with fractional numbers", () => {
    expect(() => factorial(5.69)).toThrowError();
  });

  it("throws with non-counting numbers", () => {
    expect(() => factorial(-1)).toThrowError();
  });
});
