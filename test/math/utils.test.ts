import { describe, it, expect } from "vitest";
import { gcf, lcm } from "../../src/math";

describe("gcf", () => {
  it("calculates gfc for numbers that have them", () => {
    expect(gcf(36, 9)).toBe(9);
    expect(gcf(22, 99)).toBe(11);
    expect(gcf(48, 28)).toBe(4);
  });

  it("calculates gcf as 1 for primes", () => {
    expect(gcf(17, 29)).toBe(1);
    expect(gcf(5, 19)).toBe(1);
    expect(gcf(83, 19)).toBe(1);
    expect(gcf(7757, 6961)).toBe(1);
  });

  it("throws with decimal argument", () => {
    expect(() => gcf(12, 7.9)).toThrowError("Arguments must be integers");
  });
});

describe("lcm", () => {
  it("calculates lcm for numbers that already are common", () => {
    expect(lcm(8, 4)).toBe(8);
    expect(lcm(9, 27)).toBe(27);
    expect(lcm(135, 15)).toBe(135);
  });

  it("throws with decimal argument", () => {
    expect(() => lcm(12, 7.9)).toThrowError("Arguments must be integers");
  });
});
