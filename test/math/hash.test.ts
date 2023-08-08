import { describe, it, expect } from "vitest";
import { objectHash } from "../../src/math/hash";

describe("objectHash", () => {
  it("hashes objects", async () => {
    const hash = await objectHash({ foo: 7, bar: [] }, { algorithm: "SHA-1" });
    expect(hash).toBe("1448bf86764e7ff7f9df0cb61b2d77c946ba854");
  });

  it("hashes strings", async () => {
    const hash = await objectHash("Hello, World!", { algorithm: "SHA-1" });
    expect(hash).toBe("938e9f8180ea308a796311a529bd8a5f489dadd");
  });

  it("hashes identical objects to the same hash", async () => {
    const h1 = await objectHash(
      { foo: 7, bar: "baaaaaar" },
      { algorithm: "SHA-1" }
    );
    const h2 = await objectHash(
      { foo: 7, bar: "baaaaaar" },
      { algorithm: "SHA-1" }
    );
    expect(h1).toBe(h2);
  });

  it("does not collide hashes", async () => {
    const originalHash = await objectHash({ num: 0 });
    for (let i = 1; i <= 1000; i++) {
      const hash = await objectHash({ num: i });
      expect(hash).not.toBe(originalHash);
    }
  });
});
