import { describe, it, expect } from "vitest";
import { Probability, ProbabilityEvent } from "../../src";

describe("Probability", () => {
  describe("new Probability", () => {
    it("can be constructed", () => {
      const distribution = new Probability({ value: 42 });
      expect(distribution.sample()).toEqual({ value: 42 });
    });

    it("can take events", () => {
      const distribution = new Probability({ value: 23 });
      expect(distribution.take()).toStrictEqual({ value: 23 });
      expect(distribution.take).toThrow();
    });

    it("can be constructed with multiple events", () => {
      type V = "top" | "middle" | "bottom";
      const e1: ProbabilityEvent<V> = { value: "top" };
      const e2: ProbabilityEvent<V> = { value: "middle" };
      const e3: ProbabilityEvent<V> = { value: "bottom" };

      const d = new Probability(e1, e2, e3);
      expect(d.sample()).toBe(e1);
    });
  });
});
