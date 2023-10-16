import { describe, it, expect } from "vitest";
import { Probability, ProbabilityEvent, Range } from "../../src/math";

function countSamples<T>(
  samples: Array<ProbabilityEvent<T>>,
  idFn: (value: T) => string
): Record<string, number> {
  return samples.reduce<Record<string, number>>((acc, curr) => {
    const id = idFn(curr.value);
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
}

function mermaid<T>(
  title: string,
  samples: Array<ProbabilityEvent<T>>,
  idFn: (value: T) => string
): string {
  const sampleCounts = countSamples(samples, idFn);

  let markup = `\
pie title ${title}
${Object.entries(sampleCounts)
  .map(([id, count]) => `    "${id}": ${count}`)
  .join("\n")}
  `;

  return markup;
}

function variance(actual: number, expected: number, total: number): number {
  return Math.abs((actual - expected) / expected);
}

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

  describe("distributions", () => {
    it("produces a believable distribution for large sample size", () => {
      const n = 10000;
      const p = new Probability(
        { value: "Dog", p: 0.5 },
        { value: "Cat", p: 0.25 },
        { value: "Snake", p: 0.125 },
        { value: "Chinchilla", p: 0.125 }
      );

      const samples = Range.of(n).map(() => p.sample());
      const counts = countSamples(samples, (it) => it);
      expect(variance(counts["Dog"], n * 0.5, n)).toBeLessThan(0.15);
      expect(variance(counts["Cat"], n * 0.25, n)).toBeLessThan(0.15);
      expect(variance(counts["Snake"], n * 0.125, n)).toBeLessThan(0.15);
      expect(variance(counts["Chinchilla"], n * 0.125, n)).toBeLessThan(0.15);

      // console.log(mermaid("Pets", samples, (it) => it));
    });
  });
});
