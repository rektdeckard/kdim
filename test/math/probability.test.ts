import { describe, it, expect } from "vitest";
import { Probability, ProbabilityEvent, Range, Random } from "../../src/math";

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
      const distribution = new Probability([{ value: 42 }]);
      expect(distribution.sample().value).toEqual(42);
    });

    it("can take events", () => {
      const distribution = new Probability([{ value: 23 }]);
      expect(distribution.take().value).toBe(23);
      expect(distribution.take).toThrow();
    });

    it("can be constructed with multiple events", () => {
      type V = "top" | "middle" | "bottom";
      const e1: ProbabilityEvent<V> = { value: "top" };
      const e2: ProbabilityEvent<V> = { value: "middle" };
      const e3: ProbabilityEvent<V> = { value: "bottom" };

      const d = new Probability([e1, e2, e3], new Random.Seedable(0));
      expect(d.sample().value).toBe(e1.value);
    });

    it("can be constructed with different PRNGs", () => {
      const events = [
        { value: "foo", p: 0.1 },
        { value: "bar", p: 0.5 },
        { value: "baz", p: 0.4 },
      ];

      const p1 = new Probability(events, new Random.JSF32B(1, 2, 3, 4));
      const p2 = new Probability(events, new Random.GJRand32(2, 3, 4, 5));
      const p3 = new Probability(events, new Random.SFC32(69, 420, 69, 420));
      const p4 = new Probability(events, new Random.Mulberry32(69));
      const p5 = new Probability(events, new Random.SplitMix32(420));

      expect(p1.sample().value).toBe("baz");
      expect(p2.sample().value).toBe("bar");
      expect(p3.sample().value).toBe("foo");
      expect(p4.sample().value).toBe("baz");
      expect(p5.sample().value).toBe("baz");
    });

    it("can be modified after construction", () => {
      const d = new Probability().event({ value: 1 });
      expect(d.take().value).toBe(1);
      d.event({ value: 2 });
      expect(d.take().value).toBe(2);
    });
  });

  describe("distributions", () => {
    it("produces a believable distribution for large sample size", () => {
      const n = 10000;
      const p = new Probability([
        { value: "Dog", p: 0.5 },
        { value: "Cat", p: 0.25 },
        { value: "Snake", p: 0.125 },
        { value: "Chinchilla", p: 0.125 },
      ]);

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
