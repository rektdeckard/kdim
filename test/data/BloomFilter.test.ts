import { describe, it, expect } from "vitest";
import { BloomFilter } from "../../src";

describe("BloomFilter", () => {
  it("can be added to", async () => {
    const filter = new BloomFilter({ size: 100 });
    await filter.add({ foo: 7 });
  });

  it("performs reasonably well", async () => {
    const filter = new BloomFilter();
    for (let i = 0; i < 500; i++) {
      await filter.add({ foo: i + 1 });
    }

    const hits: boolean[] = [];
    for (let i = 0; i < 500; i++) {
      hits.push(await filter.test({ foo: i + 1 }));
    }
    const hitrate =
      hits.reduce((acc, curr) => acc + Number(curr), 0) / hits.length;

    const misses: boolean[] = [];
    for (let i = 501; i < 1000; i++) {
      misses.push(await filter.test({ foo: i + 1 }));
    }
    const missrate =
      misses.reduce((acc, curr) => acc + Number(curr), 0) / misses.length;

    console.log({ hitrate, missrate });

    expect(hitrate).toBe(1);
    expect(missrate).toBeLessThan(0.03);
  });
});
