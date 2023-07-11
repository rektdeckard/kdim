import { describe, it, expect } from "vitest";
import { objectHash } from "../../src/math/hash";

describe("objectHash", () => {
  it("hashes strings", async () => {
    console.log(await objectHash({ foo: 7, bar: [] }, { algorithm: "SHA-1" }));
  });
});
