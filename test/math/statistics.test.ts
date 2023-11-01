import { describe, it, expect } from "vitest";
import {
  Statistics,
  Complex,
  Rational,
  Float,
  QUARTILES,
} from "../../src/math";
import type { FiveNumberSummary } from "../../src/math";
import { Comparator } from "../../src/data";

describe("Statistics", () => {
  describe("min", () => {
    it("calculates min of primitive numbers", () => {
      const data = [41, 42, 43, 47, 49, 6, 7, 15, 36, 39, 40];
      expect(Statistics.min(data)).toBe(6);
    });

    it("calculates min of object number types", () => {
      const data = [
        new Rational(2, 5),
        new Rational(5, 9),
        new Rational(1, 3),
        new Rational(1, 2),
        new Rational(1, 8),
        new Rational(5, 8),
      ];
      expect(Statistics.min(data)!.toFraction()).toBe("1/8");
    });
  });

  describe("max", () => {
    it("calculates max of primitive numbers", () => {
      const data = [41, 42, 43, 47, 49, 6, 7, 15, 36, 39, 40];
      expect(Statistics.max(data)).toBe(49);
    });

    it("calculates max of object number types", () => {
      const data = [
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(5, 9),
        new Rational(1, 2),
        new Rational(1, 8),
        new Rational(5, 8),
      ];
      expect(Statistics.max(data)!.toFraction()).toBe("5/8");
    });
  });

  describe("mean", () => {
    it("calculates mean of primitive numbers", () => {
      const data = [3, 2, 2, 9, 4, 7, 1];
      expect(Statistics.mean(data)).toBe(4);
    });

    it("calculates mean of object number types", () => {
      const dataC = [
        new Complex(1, -7),
        new Complex(5, 5),
        new Complex(-4, -3),
        new Complex(4, 4),
      ];
      expect(Statistics.mean(dataC)!.toString()).toBe("1.5-0.25i");
      expect(Statistics.mean(dataC)!.valueOf()).toBe(1.5);

      const dataR = [
        new Rational(1, -7),
        new Rational(5, 5),
        new Rational(-4, -3),
        new Rational(4, 4),
      ];
      expect(Statistics.mean(dataR)!.toFraction()).toBe("67/84");
      expect(Statistics.mean(dataR)!.valueOf()).toBe(67 / 84);
    });
  });

  describe("median", () => {
    it("calculates median of primitive numbers", () => {
      const dataOdd = [5, 1, 2, 10, 11, 4, 9];
      expect(Statistics.median(dataOdd)).toBe(5);

      const dataEven = [512, 128, 8, 64, 32, 2, 1, 256, 16, 4];
      expect(Statistics.median(dataEven)).toBe(24);
    });

    it("calculates median of object number types", () => {
      const dataOdd = [
        new Rational(1, 2),
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(3, 7),
        new Rational(5, 9),
      ];
      expect(Statistics.median(dataOdd)!.toFraction()).toBe("3/7");
      expect(Statistics.median(dataOdd)?.eq(new Rational(3, 7))).toBe(true);

      const dataEven = [
        new Rational(1, 2),
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(5, 11),
        new Rational(3, 7),
        new Rational(5, 9),
      ];
      expect(Statistics.median(dataEven)!.toFraction()).toBe("34/77");
      expect(Statistics.median(dataEven)?.eq(new Rational(34, 77))).toBe(true);
    });
  });

  describe("mode", () => {
    it("calculates mode of primitive numbers", () => {
      const data = [1, 5, 2, 3, 5, 7, 11, 3, 5, 4, 1];
      expect(Statistics.mode(data)).toStrictEqual([5]);
    });

    it.skip("calculates mode of object number types", () => {
      const data = [
        new Complex(1, 0),
        new Complex(2, -3),
        new Complex(2, 5),
        new Complex(1, 0),
        new Complex(1, 7),
        new Complex(2, 5),
        new Complex(-4, 5),
        new Complex(-4, -5),
        new Complex(2, 5),
        new Complex(1, 0),
      ];
      expect(Statistics.mode(data)!.map((c) => c.toString())).toStrictEqual([
        "1",
        "2+5i",
      ]);
    });
  });

  describe("variance", () => {
    it("calculates variance of primitive numbers", () => {
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(Statistics.variance(data)).toBe(4);
    });

    it("calculates variance of object number types", () => {
      const data = [
        new Complex(2, -7),
        new Complex(4, -7),
        new Complex(4, -7),
        new Complex(4, -7),
        new Complex(5, -7),
        new Complex(5, -7),
        new Complex(7, -7),
        new Complex(9, -7),
      ];
      expect(Statistics.variance(data)?.toString()).toBe("4");
    });
  });

  describe("sd", () => {
    it("calculates standard deviation of primitive numbers", () => {
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(Statistics.sd(data)).toBe(2);
    });

    it("calculates standard deviation of object number types", () => {
      const data = [
        new Float(2),
        new Float(4),
        new Float(4),
        new Float(4),
        new Float(5),
        new Float(5),
        new Float(7),
        new Float(9),
      ];
      expect(Statistics.sd(data)?.valueOf()).toBe(2);
    });
  });

  describe("sem", () => {
    it("calculates standard error of the mean of primitive numbers", () => {
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(Statistics.sem(data)).toBe(0.7071067811865475);
    });

    it("calculates standard error of the mean of object number types", () => {
      const data = [
        new Float(2),
        new Float(4),
        new Float(4),
        new Float(4),
        new Float(5),
        new Float(5),
        new Float(7),
        new Float(9),
      ];
      expect(Statistics.sem(data)?.valueOf()).toBe(0.7071067811865475);
    });
  });

  describe("range", () => {
    it("calculates range of primitive numbers", () => {
      const data = [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49];
      expect(Statistics.range(data)).toBe(43);
    });

    it("calculates range of object number types", () => {
      const data = [
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(5, 9),
        new Rational(1, 2),
        new Rational(1, 8),
        new Rational(5, 8),
      ];
      expect(Statistics.range(data)!.toFraction()).toBe("1/2");
    });
  });

  describe("iqr", () => {
    it("calculates iqr of primitive numbers", () => {
      const data = [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49];

      expect(Statistics.iqr(data, { method: "hrank" })).toBe(7);
      expect(Statistics.iqr(data, { method: "lrank" })).toBe(27);
      expect(Statistics.iqr(data, { method: "midpoint" })).toBe(17);
      expect(Statistics.iqr(data, { method: "nearest" })).toBe(7);
      expect(Statistics.iqr(data, { method: "outer" })).toBe(28);
      expect(Statistics.iqr(data, { method: "weighted" })).toBe(17);
    });

    it("calculates iqr of object number types", () => {
      const data = [
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(5, 9),
        new Rational(1, 2),
        new Rational(1, 8),
        new Rational(5, 8),
      ];

      expect(Statistics.iqr(data, { method: "hrank" })!.toFraction()).toBe(
        "7/45"
      );
      expect(Statistics.iqr(data, { method: "lrank" })!.toFraction()).toBe(
        "1/6"
      );
      expect(Statistics.iqr(data, { method: "midpoint" })!.toFraction()).toBe(
        "29/180"
      );
      expect(Statistics.iqr(data, { method: "nearest" })!.toFraction()).toBe(
        "2/9"
      );
      expect(Statistics.iqr(data, { method: "outer" })!.toFraction()).toBe(
        "2/9"
      );
      expect(Statistics.iqr(data, { method: "weighted" })!.toFraction()).toBe(
        "23/120"
      );
    });
  });

  describe("mad", () => {
    it("calculates median absolute deviation of primitive numbers", () => {
      const data = [1, 2, 1, 4, 2, 6, 9];
      expect(Statistics.mad(data)).toBe(1);
    });

    it("calculates median absolute deviation of object number types", () => {
      const data = [
        new Rational(9, 20), // ad: 15/40
        new Rational(1, 5), // ad: 25/40
        new Rational(6, 5), // ad: 15/40
        new Rational(2, 1), // ad: 47/40
      ]; // sd: 33/40
      expect(Statistics.mad(data)?.toFraction()).toBe("1/2");
    });
  });

  describe("percentiles", () => {
    it("calculates percentiles of primitive numbers", () => {
      const data = [
        40, 50, 95, 20, 42, 59, 75, 89, 83, 57, 54, 2, 36, 36, 56, 30, 63, 46,
        11, 22, 1, 85, 44, 11, 70, 4, 65, 0, 5, 53, 58, 58, 11, 99, 60, 61, 100,
        68, 92, 69, 80, 73, 72, 92, 77, 5, 48, 20, 92, 91, 93, 65, 48, 61, 21,
        78, 91, 54, 32, 12, 51, 57, 59, 86, 0, 98, 20, 0, 16, 94, 19, 46, 28,
        14, 6, 65, 88, 99, 68, 30, 49, 25, 14, 97, 82, 17, 48, 98, 64, 84, 69,
        60, 10, 94, 38, 5, 6, 15, 1, 79,
      ];
      data.sort(Comparator.numericCompare);

      expect(Statistics.percentiles(data, { p: QUARTILES })).toStrictEqual(
        Statistics.percentiles(data, { p: QUARTILES, method: "midpoint" })
      );
      expect(
        Statistics.percentiles(data, { p: QUARTILES, method: "hrank" })
      ).toStrictEqual([0, 20, 56, 78, 100]);
      expect(
        Statistics.percentiles(data, { p: QUARTILES, method: "lrank" })
      ).toStrictEqual([0, 20, 54, 77, 100]);
      expect(
        Statistics.percentiles(data, { p: QUARTILES, method: "midpoint" })
      ).toStrictEqual([0, 20, 55, 77.5, 100]);
      expect(
        Statistics.percentiles(data, { p: QUARTILES, method: "nearest" })
      ).toStrictEqual([0, 20, 56, 77, 100]);
      expect(
        Statistics.percentiles(data, { p: QUARTILES, method: "outer" })
      ).toStrictEqual([0, 20, 55, 78, 100]);
      expect(
        Statistics.percentiles(data, {
          p: QUARTILES,
          method: "weighted",
        })
      ).toStrictEqual([0, 20, 55, 77.25, 100]);
    });

    it("calculates percentiles of object number types", () => {});
  });

  describe("summary", () => {
    it("calculates five-number summary of primitive numbers", () => {
      const data = [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49];
      expect(Statistics.summary(data)).toStrictEqual({
        q0: 6,
        q1: 25.5,
        q2: 40,
        q3: 42.5,
        q4: 49,
      });
      expect(Statistics.summary(data, { method: "weighted" })).toStrictEqual({
        q0: 6,
        q1: 25.5,
        q2: 40,
        q3: 42.5,
        q4: 49,
      });
      expect(Statistics.summary(data, { method: "hrank" })).toStrictEqual({
        q0: 6,
        q1: 36,
        q2: 40,
        q3: 43,
        q4: 49,
      });
      expect(Statistics.summary(data, { method: "lrank" })).toStrictEqual({
        q0: 6,
        q1: 15,
        q2: 40,
        q3: 42,
        q4: 49,
      });
      expect(Statistics.summary(data, { method: "outer" })).toStrictEqual({
        q0: 6,
        q1: 15,
        q2: 40,
        q3: 43,
        q4: 49,
      });
      expect(Statistics.summary(data, { method: "nearest" })).toStrictEqual({
        q0: 6,
        q1: 36,
        q2: 40,
        q3: 43,
        q4: 49,
      });
    });

    it("calculates five-number summary of object number types", () => {
      const data = [
        new Rational(1, 3),
        new Rational(2, 5),
        new Rational(5, 9),
        new Rational(1, 2),
        new Rational(1, 8),
        new Rational(5, 8),
      ];

      function serialize(summary: FiveNumberSummary<Rational>) {
        return Object.entries(summary).reduce((acc, [k, v]) => {
          acc[k] = v.toFraction();
          return acc;
        }, {});
      }

      expect(
        serialize(Statistics.summary(data, { method: "hrank" })!)
      ).toStrictEqual({
        q0: "1/8",
        q1: "2/5",
        q2: "1/2",
        q3: "5/9",
        q4: "5/8",
      });
      expect(
        serialize(Statistics.summary(data, { method: "lrank" })!)
      ).toStrictEqual({
        q0: "1/8",
        q1: "1/3",
        q2: "2/5",
        q3: "1/2",
        q4: "5/8",
      });
      expect(
        serialize(Statistics.summary(data, { method: "midpoint" })!)
      ).toStrictEqual({
        q0: "1/8",
        q1: "11/30",
        q2: "9/20",
        q3: "19/36",
        q4: "5/8",
      });
      expect(
        serialize(Statistics.summary(data, { method: "outer" })!)
      ).toStrictEqual({
        q0: "1/8",
        q1: "1/3",
        q2: "9/20",
        q3: "5/9",
        q4: "5/8",
      });
      expect(
        serialize(Statistics.summary(data, { method: "weighted" })!)
      ).toStrictEqual({
        q0: "1/8",
        q1: "7/20",
        q2: "9/20",
        q3: "13/24",
        q4: "5/8",
      });
    });
  });
});
