import { describe, it, expect } from "vitest";
import { RationalNumber, FRACTION_SLASH } from "../../src/math";

describe("Rational", () => {
  describe("constructor", () => {
    it("throws with non-integral arguments", () => {
      expect(() => new RationalNumber(2, 3.5)).toThrowError(
        "Arguments must be integers"
      );
    });

    it("constructs a rational", () => {
      const r = new RationalNumber(2, 9);
      expect(r.numerator).toBe(2);
      expect(r.denominator).toBe(9);
    });

    it("simplifies during construction", () => {
      const r = new RationalNumber(8, -24);
      expect([r.numerator, r.denominator]).toStrictEqual([-1, 3]);
    });
  });

  describe("parse", () => {
    it("parses a normal fraction", () => {
      const oneThird = RationalNumber.parse("1/3");
      expect(oneThird.numerator).toBe(1);
      expect(oneThird.denominator).toBe(3);

      const twoNinths = RationalNumber.parse("  2   /   9  ");
      expect(twoNinths.numerator).toBe(2);
      expect(twoNinths.denominator).toBe(9);
    });

    it("parses an improper fraction", () => {
      const fiveAndOneSeventh = RationalNumber.parse("12/7");
      expect(fiveAndOneSeventh.numerator).toBe(12);
      expect(fiveAndOneSeventh.denominator).toBe(7);
    });

    it("parses a mixed number", () => {
      const fiveAndOneSeventh = RationalNumber.parse("5 1/7");
      expect(fiveAndOneSeventh.numerator).toBe(36);
      expect(fiveAndOneSeventh.denominator).toBe(7);
    });

    it("parses a weird but legal mixed and improper fraction", () => {
      const fiveAndOneSeventh = RationalNumber.parse("5 8/7");
      expect(fiveAndOneSeventh.numerator).toBe(43);
      expect(fiveAndOneSeventh.denominator).toBe(7);
    });

    it("throws with decimals", () => {
      expect(() => RationalNumber.parse("9.3 / 5")).toThrowError(
        "Arguments must be integers"
      );
    });
  });

  describe("from", () => {
    it("returns a rational as-is", () => {
      const r = new RationalNumber(33, 5);
      expect(RationalNumber.from(r)).toBeInstanceOf(RationalNumber);
      expect(RationalNumber.from(r)).toBe(r);
    });

    it("creates a rational from an integer", () => {
      const r = RationalNumber.from(13);
      expect(r.numerator).toBe(13);
      expect(r.denominator).toBe(1);
    });

    it("parses a rational from a string", () => {
      const r = RationalNumber.from("37 / 11");
      expect(r.numerator).toBe(37);
      expect(r.denominator).toBe(11);
    });

    it("throws with decimals", () => {
      expect(() => RationalNumber.from("1 / 4.7")).toThrowError(
        "Arguments must be integers"
      );
    });
  });

  describe("add", () => {
    it("adds similar fractions", () => {
      const fourths = RationalNumber.from("1 / 4").add(
        RationalNumber.from("2 / 4")
      );
      expect([fourths.numerator, fourths.denominator]).toStrictEqual([3, 4]);

      const thirteenths = new RationalNumber(5, 13).add(
        new RationalNumber(1, 13)
      );
      expect([thirteenths.numerator, thirteenths.denominator]).toStrictEqual([
        6, 13,
      ]);
    });

    it("adds dissimilar fractions", () => {
      const thirtyFifths = new RationalNumber(6, 7).add(
        new RationalNumber(1, 5)
      );
      expect([thirtyFifths.numerator, thirtyFifths.denominator]).toStrictEqual([
        37, 35,
      ]);

      const twentyEigths = new RationalNumber(2, 7).add(
        new RationalNumber(1, 4)
      );
      expect([twentyEigths.numerator, twentyEigths.denominator]).toStrictEqual([
        15, 28,
      ]);
    });
  });

  describe("sub", () => {
    it("subtracts similar fractions", () => {
      const fourths = RationalNumber.from("1 / 4").sub(
        RationalNumber.from("2 / 4")
      );
      expect([fourths.numerator, fourths.denominator]).toStrictEqual([-1, 4]);

      const thirteenths = new RationalNumber(5, 13).sub(
        new RationalNumber(1, 13)
      );
      expect([thirteenths.numerator, thirteenths.denominator]).toStrictEqual([
        4, 13,
      ]);
    });

    it("subtracts dissimilar fractions", () => {
      const thirtyFifths = new RationalNumber(6, 7).sub(
        new RationalNumber(1, 5)
      );
      expect([thirtyFifths.numerator, thirtyFifths.denominator]).toStrictEqual([
        23, 35,
      ]);

      const twentyEigths = new RationalNumber(2, 7).sub(
        new RationalNumber(1, 4)
      );
      expect([twentyEigths.numerator, twentyEigths.denominator]).toStrictEqual([
        1, 28,
      ]);
    });
  });

  describe("mul", () => {
    it("multiplies by integers", () => {
      const p = RationalNumber.from(3, 13).mul(5);
      expect([p.numerator, p.denominator]).toStrictEqual([15, 13]);
    });

    it("multiplies by similar fractions", () => {
      const p = new RationalNumber(1, 3).mul(1, 3);
      expect([p.numerator, p.denominator]).toStrictEqual([1, 9]);
    });

    it("multiplies by dissimilar fractions", () => {
      const p = new RationalNumber(1, 3).mul(1, 3);
      expect([p.numerator, p.denominator]).toStrictEqual([1, 9]);
    });

    it("simplifies in the process of multiplication", () => {
      const p = RationalNumber.from(3, 8).mul(2, -5);
      expect([p.numerator, p.denominator]).toStrictEqual([-3, 20]);
    });
  });

  describe("div", () => {
    it("divides by integers", () => {
      const d = new RationalNumber(4, 9).div(4);
      expect([d.numerator, d.denominator]).toStrictEqual([1, 9]);

      const e = new RationalNumber(5, 13).div(6);
      expect([e.numerator, e.denominator]).toStrictEqual([5, 78]);
    });

    it("divides by fractions", () => {
      const d = new RationalNumber(17, 41).div(4, 3);
      expect([d.numerator, d.denominator]).toStrictEqual([51, 164]);
    });
  });

  describe("pow", () => {
    it("raises to integer exponent", () => {
      const p = new RationalNumber(1, 4).pow(3);
      expect([p.numerator, p.denominator]).toStrictEqual([1, 64]);
    });

    // TODO: should we support negative exponents? Rational exponents?
    it.skip("raises to negative integer exponent", () => {
      const p = new RationalNumber(1, 4).pow(-2);
      expect([p.numerator, p.denominator]).toStrictEqual([64, 1]);
    });
  });

  describe("mod", () => {
    it("performs integer modulus of fraction", () => {
      const m = new RationalNumber(23, 5).mod(1);
      expect([m.numerator, m.denominator]).toStrictEqual([3, 5]);

      const n = new RationalNumber(41, 7).mod(3);
      expect([n.numerator, n.denominator]).toStrictEqual([20, 7]);
    });
  });

  describe("abs", () => {
    it("takes the absolute value of a fraction", () => {
      const a = new RationalNumber(-5, 9).abs();
      expect([a.numerator, a.denominator]).toStrictEqual([5, 9]);
    });
  });

  describe("eq", () => {
    it("considers equal similar fractions equal", () => {
      expect(RationalNumber.from(1, 3).eq(1, 3)).toBe(true);
      expect(RationalNumber.from(7, 31).eq(7, 31)).toBe(true);
    });

    it("considers equivalent fractions equal", () => {
      expect(RationalNumber.from(1, 2).eq(3, 6)).toBe(true);
      expect(RationalNumber.from(101, 3).eq(303, 9)).toBe(true);
    });

    it("works the same for all argument types", () => {
      const r = new RationalNumber(2, 3);
      expect(r.eq(2, 3)).toBe(true);
      expect(r.eq(new RationalNumber(2, 3))).toBe(true);
      expect(r.eq(RationalNumber.from("2 / 3"))).toBe(true);
    });
  });

  describe("gt", () => {
    it("compares similar fractions", () => {
      expect(RationalNumber.from(3, 4).gt(1, 4)).toBe(true);
      expect(RationalNumber.from(3, 4).gt(3, 4)).toBe(false);
      expect(RationalNumber.from(1, 4).gt(3, 4)).toBe(false);
    });

    it("compares dissimilar fractions", () => {
      expect(RationalNumber.from(2, 5).gt(2, 6)).toBe(true);
      expect(RationalNumber.from(2, 5).gt(2, 5)).toBe(false);
      expect(RationalNumber.from(2, 6).gt(2, 5)).toBe(false);
    });
  });

  describe("gte", () => {
    it("compares similar fractions", () => {
      expect(RationalNumber.from(3, 4).gte(1, 4)).toBe(true);
      expect(RationalNumber.from(3, 4).gte(3, 4)).toBe(true);
      expect(RationalNumber.from(1, 4).gte(3, 4)).toBe(false);
    });

    it("compares dissimilar fractions", () => {
      expect(RationalNumber.from(2, 5).gte(2, 6)).toBe(true);
      expect(RationalNumber.from(2, 5).gte(2, 5)).toBe(true);
      expect(RationalNumber.from(2, 6).gte(2, 5)).toBe(false);
    });
  });

  describe("lt", () => {
    it("compares similar fractions", () => {
      expect(RationalNumber.from(1, 9).lt(2, 9)).toBe(true);
      expect(RationalNumber.from(1, 17).lt(1, 17)).toBe(false);
      expect(RationalNumber.from(2, 9).lt(1, 9)).toBe(false);
    });

    it("compares dissimilar fractions", () => {
      expect(RationalNumber.from(13, 8).lt(13, 7)).toBe(true);
      expect(RationalNumber.from(13, 7).lt(13, 8)).toBe(false);
      expect(RationalNumber.from(13, 7).lt(13, 7)).toBe(false);
    });
  });

  describe("lte", () => {
    it("compares similar fractions", () => {
      expect(RationalNumber.from(1, 9).lte(2, 9)).toBe(true);
      expect(RationalNumber.from(1, 17).lte(1, 17)).toBe(true);
      expect(RationalNumber.from(2, 9).lte(1, 9)).toBe(false);
    });

    it("compares dissimilar fractions", () => {
      expect(RationalNumber.from(13, 8).lte(13, 7)).toBe(true);
      expect(RationalNumber.from(13, 7).lte(13, 8)).toBe(false);
      expect(RationalNumber.from(13, 7).lte(13, 7)).toBe(true);
      expect(RationalNumber.from(13, 7).lte(26, 14)).toBe(true);
    });
  });

  describe("toFraction", () => {
    it("can serialize a standard fraction", () => {
      const f = new RationalNumber(7, 16);
      expect(f.toFraction()).toBe("7/16");

      const g = new RationalNumber(11, 8);
      expect(g.toFraction({ mixed: true })).toBe("1 3/8");

      const e = new RationalNumber(3, 8);
      expect(e.toFraction({ mixed: true })).toBe("3/8");
    });

    it("can serialize a standard fraction with spaces", () => {
      const f = new RationalNumber(7, 16);
      expect(f.toFraction({ format: "space" })).toBe("7 / 16");

      const g = new RationalNumber(11, 8);
      expect(g.toFraction({ mixed: true, format: "space" })).toBe("1 3 / 8");
    });

    it("can serialize to a unicode vulgar fraction", () => {
      const f = new RationalNumber(7, 16);
      expect(f.toFraction({ format: "unicode" })).toBe(`7${FRACTION_SLASH}16`);

      const g = new RationalNumber(11, 8);
      expect(g.toFraction({ mixed: true, format: "unicode" })).toBe(
        `1 3${FRACTION_SLASH}8`
      );
    });
  });

  describe("real-world", () => {
    it("can chan multiple operations and maintain precision", () => {
      const r = new RationalNumber(5, 31).add(3, 9).mul(12).div(5, 4).mod(1);
      expect(r.toFixed(3)).toBe("0.748");
      expect(r.toFraction()).toBe("116/155");
    });
  });
});
