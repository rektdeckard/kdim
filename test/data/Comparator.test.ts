import { describe, it, expect } from "vitest";
import { Comparator, CompareFunction } from "../../src";

describe("Comparator", () => {
  describe("new Comparator", () => {
    it("can be constructed with defaults", () => {
      const c = new Comparator<number>();
      expect(c.eq(5, 5)).toBe(true);
      expect(c.gt(10, 2)).toBe(false);
    });

    it("can be constructed with built-in comparisons", () => {
      const c = new Comparator<number>(Comparator.reverseNumericCompare);
      expect(c.eq(5, 5)).toBe(true);
      expect(c.gt(10, 2)).toBe(true);

      const d = new Comparator<string>(Comparator.reverseLexicalCompare);
      expect(d.gt("z", "a")).toBe(true);
      expect(d.eq("z", "z")).toBe(true);
    });
  });

  describe("built-in comparisons", () => {
    it("numericCompare", () => {
      const nc = new Comparator<number>(Comparator.numericCompare);

      expect(nc.eq(10, 10)).toBe(true);
      expect(nc.gt(3, 10)).toBe(true);
      expect(nc.gte(3, 3)).toBe(true);
      expect(nc.gte(3, 10)).toBe(true);
      expect(nc.lt(10, 3)).toBe(true);
      expect(nc.lte(10, 3)).toBe(true);
      expect(nc.lte(3, 3)).toBe(true);
    });

    it("reverseNumericCompare", () => {
      const rnc = new Comparator<number>(Comparator.reverseNumericCompare);

      expect(rnc.eq(10, 10)).toBe(true);
      expect(rnc.gt(3, 10)).toBe(false);
      expect(rnc.gte(3, 3)).toBe(true);
      expect(rnc.gte(3, 10)).toBe(false);
      expect(rnc.lt(10, 3)).toBe(false);
      expect(rnc.lte(10, 3)).toBe(false);
      expect(rnc.lte(3, 3)).toBe(true);
    });

    it("lecicalCompare", () => {
      const lc = new Comparator<string | number>();

      expect(lc.eq(10, 10)).toBe(true);
      expect(lc.gt(3, 10)).toBe(true);
      expect(lc.gte(3, 3)).toBe(true);
      expect(lc.gte(3, 10)).toBe(true);
      expect(lc.lt(10, 3)).toBe(true);
      expect(lc.lte(10, 3)).toBe(true);
      expect(lc.lte(3, 3)).toBe(true);

      expect(lc.eq("qux", "qux")).toBe(true);
      expect(lc.gt("baz", "qux")).toBe(true);
      expect(lc.gte("baz", "baz")).toBe(true);
      expect(lc.gte("baz", "qux")).toBe(true);
      expect(lc.lt("qux", "baz")).toBe(true);
      expect(lc.lte("qux", "baz")).toBe(true);
      expect(lc.lte("baz", "baz")).toBe(true);
    });

    it("reverseLecicalCompare", () => {
      const rlc = new Comparator<string | number>(
        Comparator.reverseLexicalCompare
      );

      expect(rlc.eq(10, 10)).toBe(true);
      expect(rlc.gt(3, 10)).toBe(false);
      expect(rlc.gte(3, 3)).toBe(true);
      expect(rlc.gte(3, 10)).toBe(false);
      expect(rlc.lt(10, 3)).toBe(false);
      expect(rlc.lte(10, 3)).toBe(false);
      expect(rlc.lte(3, 3)).toBe(true);

      expect(rlc.eq("qux", "qux")).toBe(true);
      expect(rlc.gt("baz", "qux")).toBe(false);
      expect(rlc.gte("baz", "baz")).toBe(true);
      expect(rlc.gte("baz", "qux")).toBe(false);
      expect(rlc.lt("qux", "baz")).toBe(false);
      expect(rlc.lte("qux", "baz")).toBe(false);
      expect(rlc.lte("baz", "baz")).toBe(true);
    });
  });

  describe("custom comparison", () => {
    type Foo = { bar: number; baz: string };

    const fooCompare: CompareFunction<Foo> = (a, b) =>
      a.baz === b.baz ? a.bar - b.bar : a.baz > b.baz ? 1 : -1;

    const fooComparator = new Comparator<Foo>(fooCompare);

    it("sorts as we expect", () => {
      const foos: Foo[] = [
        { bar: 5, baz: "a" },
        { bar: 10, baz: "a" },
        { bar: 3, baz: "b" },
        { bar: -1, baz: "a" },
        { bar: 1, baz: "b" },
        { bar: 9, baz: "b" },
      ];

      expect(foos.sort(fooCompare)).toStrictEqual([
        { bar: -1, baz: "a" },
        { bar: 5, baz: "a" },
        { bar: 10, baz: "a" },
        { bar: 1, baz: "b" },
        { bar: 3, baz: "b" },
        { bar: 9, baz: "b" },
      ]);
    });

    it("compares as we expect", () => {
      expect(
        fooComparator.eq({ bar: 1, baz: "yes" }, { bar: 1, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.gt({ bar: 1, baz: "yes" }, { bar: 2, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.gt({ bar: 1, baz: "no" }, { bar: 1, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.gt({ bar: 1, baz: "no" }, { bar: 2, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.gte({ bar: 1, baz: "no" }, { bar: 2, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.lt({ bar: 1, baz: "yes" }, { bar: -1, baz: "yes" })
      ).toBe(true);
      expect(
        fooComparator.lte({ bar: 1, baz: "yes" }, { bar: -1, baz: "yes" })
      ).toBe(true);
    });
  });
});
