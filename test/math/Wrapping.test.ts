import { describe, it, expect } from "vitest";
import { Wrapping } from "../../src";

describe("Wrapping", () => {
  describe("new Wrapping()", () => {
    it("can be constructed", () => {
      const u8 = new Wrapping({ max: 7 });
      expect(u8.value).toBe(0);
      expect(u8.min).toBe(0);
      expect(u8.max).toBe(7);
    });

    it("can be constructed with numeric initial value", () => {
      const u16 = new Wrapping({ max: 0xffff }, 0xabcd);
      expect(u16.value).toBe(0xabcd);
      expect(u16.min).toBe(0);
      expect(u16.max).toBe(0xffff);
    });

    it("can be constructed with custom range", () => {
      const i8 = new Wrapping({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.value).toBe(0);
      expect(i8.min).toBe(-128);
      expect(i8.max).toBe(127);
    });

    it("can be constructed using the from() factory", () => {
      const first = new Wrapping({ min: -5, max: 5 }, 0);
      const second = Wrapping.from(first);
      expect(first.value).toBe(second.value);
      expect(first.min).toBe(second.min);
      expect(first.max).toBe(second.max);
    });

    it("throws with non-integer values", () => {
      expect(() => new Wrapping({ max: 4.2 })).toThrow(RangeError);
      expect(() => new Wrapping({ min: 2, max: 10 }, 3.5)).toThrow(RangeError);
    });

    it("throws with invalid range", () => {
      expect(() => new Wrapping({ min: 10, max: 0 })).toThrow(RangeError);
    });
  });

  describe("Wapping.add()", () => {
    it("performs non-wrapping addition", () => {
      const u8 = new Wrapping({ max: 7 }, 3);
      expect(u8.add(1).value).toBe(4);
    });

    it("performs wrapping addition", () => {
      const u8 = new Wrapping({ max: 7 }, 4);
      expect(u8.add(5).value).toBe(1);
    });

    it("performs modular wrapping addition", () => {
      const u8 = new Wrapping({ max: 7 }, 1);
      expect(u8.add(32).value).toBe(1);
      expect(u8.add(33).value).toBe(2);
    });

    it("performs non-wrapping addition with negative addend", () => {
      const u8 = new Wrapping({ max: 7 }, 2);
      expect(u8.add(-1).value).toBe(1);
    });

    it("performs wrapping addition with negative addend", () => {
      const u8 = new Wrapping({ max: 7 }, 1);
      expect(u8.add(-6).value).toBe(3);
    });

    it("performs wrapping addition with custom range", () => {
      const i8 = new Wrapping({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.add(200).value).toBe(-56);
    });

    it("performs addition with a Wrapping addend", () => {
      const u8a = new Wrapping({ max: 7 }, 3);
      const u8b = new Wrapping({ max: 7 }, 7);
      expect(u8a.add(u8b).value).toBe(2);

      const u274 = new Wrapping({ max: 273 }, 100);
      expect(u8a.add(u274).value).toBe(6);
      expect(u274.add(u8b).value).toBe(107);
    });

    it("throws with non-integer value", () => {
      expect(() => new Wrapping({ max: 4 }).add(1.1)).toThrow(RangeError);
    });
  });

  describe("Wapping.sub()", () => {
    it("performs non-wrapping subtraction", () => {
      const u8 = new Wrapping({ max: 7 }, 3);
      expect(u8.sub(1).value).toBe(2);
    });

    it("performs wrapping subtraction", () => {
      const u8 = new Wrapping({ max: 7 }, 2);
      expect(u8.sub(5).value).toBe(5);
    });

    it("performs modular wrapping subtraction", () => {
      const u8 = new Wrapping({ max: 7 }, 5);
      expect(u8.sub(32).value).toBe(5);
      expect(u8.sub(33).value).toBe(4);
    });

    it("performs non-wrapping subtraction with negative addend", () => {
      const u8 = new Wrapping({ max: 7 }, 4);
      expect(u8.sub(-1).value).toBe(5);
    });

    it("performs wrapping subtraction with negative addend", () => {
      const u8 = new Wrapping({ max: 7 }, 5);
      expect(u8.sub(-6).value).toBe(3);
    });

    it("performs wrapping subtraction with custom range", () => {
      const i8 = new Wrapping({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.sub(129).value).toBe(127);
    });

    it("throws with non-integer value", () => {
      expect(() => new Wrapping({ max: 4 }).sub(1.1)).toThrow(RangeError);
    });
  });
});
