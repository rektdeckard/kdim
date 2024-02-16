import { describe, it, expect } from "vitest";
import { Noise, Random } from "../../src";

describe("Noise", () => {
  describe("Perlin", () => {
    describe("construct", () => {
      it("can construct a Perlin generator", () => {
        const g = new Noise.Perlin();
        expect(g).toBeDefined();
      });

      it("can construct with a prng", () => {
        const g = new Noise.Perlin(new Random.Seedable(13));
        const f = new Noise.Perlin(new Random.Seedable(13));
        expect(f.xy(2, 2)).toBe(g.xy(2, 2));
      });
    });

    describe("xy", () => {
      it("can create noise", () => {
        const g = new Noise.Perlin(new Random.Seedable(13));
        const [w, h] = [40, 40];

        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const v = g.xy(x, y);
            expect(v).toBeLessThanOrEqual(1);
            expect(v).toBeGreaterThanOrEqual(-1);
          }
        }
      });
    });

    describe("fill", () => {
      it("can fill 2D arrays", () => {
        const p = new Noise.Perlin();
        const arr = Array(20)
          .fill(null)
          .map(() => Array(20).fill(0));

        p.fill(arr);
        expect(arr.every((r) => r.some((v) => v !== 0)));
      });

      it("can fill an ImageData", () => {
        // Polyfill for node environment
        if (!globalThis.ImageData) {
          // @ts-ignore
          globalThis.ImageData = class {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            colorSpace: "display-p3" | "srgb";

            constructor(sw: number, sh: number) {
              this.width = sw;
              this.height = sh;
              this.data = new Uint8ClampedArray(sw * sh * 4);
            }
          };
        }

        const p = new Noise.Perlin().seed(1);
        const d = new ImageData(8, 8);
        p.fill(d);
        expect(Array.from(d.data)).toStrictEqual([
          128, 128, 128, 255, 126, 126, 126, 255, 118, 118, 118, 255, 106, 106,
          106, 255, 96, 96, 96, 255, 93, 93, 93, 255, 99, 99, 99, 255, 112, 112,
          112, 255, 114, 114, 114, 255, 112, 112, 112, 255, 105, 105, 105, 255,
          96, 96, 96, 255, 90, 90, 90, 255, 91, 91, 91, 255, 100, 100, 100, 255,
          114, 114, 114, 255, 109, 109, 109, 255, 108, 108, 108, 255, 103, 103,
          103, 255, 97, 97, 97, 255, 95, 95, 95, 255, 98, 98, 98, 255, 109, 109,
          109, 255, 123, 123, 123, 255, 115, 115, 115, 255, 114, 114, 114, 255,
          111, 111, 111, 255, 108, 108, 108, 255, 109, 109, 109, 255, 115, 115,
          115, 255, 125, 125, 125, 255, 138, 138, 138, 255, 128, 128, 128, 255,
          127, 127, 127, 255, 126, 126, 126, 255, 125, 125, 125, 255, 128, 128,
          128, 255, 133, 133, 133, 255, 142, 142, 142, 255, 151, 151, 151, 255,
          140, 140, 140, 255, 140, 140, 140, 255, 140, 140, 140, 255, 140, 140,
          140, 255, 142, 142, 142, 255, 147, 147, 147, 255, 152, 152, 152, 255,
          157, 157, 157, 255, 146, 146, 146, 255, 146, 146, 146, 255, 146, 146,
          146, 255, 147, 147, 147, 255, 148, 148, 148, 255, 150, 150, 150, 255,
          152, 152, 152, 255, 154, 154, 154, 255, 141, 141, 141, 255, 141, 141,
          141, 255, 141, 141, 141, 255, 142, 142, 142, 255, 142, 142, 142, 255,
          142, 142, 142, 255, 143, 143, 143, 255, 143, 143, 143, 255,
        ]);
      });
    });
  });

  describe("Simplex", () => {
    describe("construct", () => {
      it("can construct a Simplex generator", () => {
        const g = new Noise.Simplex();
        expect(g).toBeDefined();
      });

      it("can construct with a prng", () => {
        const g = new Noise.Simplex(new Random.Seedable(13));
        const f = new Noise.Simplex(new Random.Seedable(13));
        expect(f.xy(2, 2)).toBe(g.xy(2, 2));
      });
    });

    describe("xy", () => {
      it("can create noise", () => {
        const g = new Noise.Simplex().seed(0);
        const [w, h] = [40, 40];

        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const v = g.xy(x, y);
            expect(v).toBeLessThanOrEqual(1);
            expect(v).toBeGreaterThanOrEqual(-1);
          }
        }
      });
    });

    describe("fill", () => {
      it("can fill 2D arrays", () => {
        const p = new Noise.Simplex();
        const arr = Array(20)
          .fill(null)
          .map(() => Array(20).fill(0));

        p.fill(arr);

        arr.forEach((r) =>
          r.forEach((v) => {
            expect(v).toBeLessThanOrEqual(255);
            expect(v).toBeGreaterThanOrEqual(0);
          })
        );
      });

      it("can fill an ImageData", () => {
        // Polyfill for node environment
        if (!globalThis.ImageData) {
          // @ts-ignore
          globalThis.ImageData = class {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            colorSpace: "display-p3" | "srgb";

            constructor(sw: number, sh: number) {
              this.width = sw;
              this.height = sh;
              this.data = new Uint8ClampedArray(sw * sh * 4);
            }
          };
        }

        const p = new Noise.Simplex().seed(1);
        const d = new ImageData(8, 8);
        p.fill(d);
        expect(Array.from(d.data)).toStrictEqual([
          128, 128, 128, 255, 127, 127, 127, 255, 124, 124, 124, 255, 105, 105,
          105, 255, 82, 82, 82, 255, 82, 82, 82, 255, 115, 115, 115, 255, 161,
          161, 161, 255, 66, 66, 66, 255, 74, 74, 74, 255, 97, 97, 97, 255, 121,
          121, 121, 255, 131, 131, 131, 255, 133, 133, 133, 255, 140, 140, 140,
          255, 161, 161, 161, 255, 49, 49, 49, 255, 61, 61, 61, 255, 103, 103,
          103, 255, 154, 154, 154, 255, 186, 186, 186, 255, 189, 189, 189, 255,
          177, 177, 177, 255, 177, 177, 177, 255, 96, 96, 96, 255, 96, 96, 96,
          255, 130, 130, 130, 255, 175, 175, 175, 255, 203, 203, 203, 255, 206,
          206, 206, 255, 190, 190, 190, 255, 181, 181, 181, 255, 160, 160, 160,
          255, 141, 141, 141, 255, 142, 142, 142, 255, 156, 156, 156, 255, 167,
          167, 167, 255, 168, 168, 168, 255, 160, 160, 160, 255, 157, 157, 157,
          255, 176, 176, 176, 255, 148, 148, 148, 255, 124, 124, 124, 255, 109,
          109, 109, 255, 103, 103, 103, 255, 102, 102, 102, 255, 107, 107, 107,
          255, 120, 120, 120, 255, 142, 142, 142, 255, 128, 128, 128, 255, 104,
          104, 104, 255, 77, 77, 77, 255, 57, 57, 57, 255, 54, 54, 54, 255, 73,
          73, 73, 255, 111, 111, 111, 255, 97, 97, 97, 255, 110, 110, 110, 255,
          112, 112, 112, 255, 97, 97, 97, 255, 75, 75, 75, 255, 63, 63, 63, 255,
          83, 83, 83, 255, 133, 133, 133, 255,
        ]);
      });
    });
  });

  describe.runIf("crypto" in globalThis)("Color", () => {
    describe("construct", () => {
      it("can construct a Color generator", () => {
        const g = new Noise.Color();
        expect(g).toBeDefined();
      });

      it("can construct with a prng", () => {
        const g = new Noise.Color(new Random.Seedable(13));
        const f = new Noise.Color(new Random.Seedable(13));
        expect(f.xy(2, 2)).toBe(g.xy(2, 2));
      });
    });

    describe("xy", () => {
      it("can create noise", () => {
        const g = new Noise.Color();
        const [w, h] = [40, 40];

        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const v = g.xy(x, y);
            expect(v).toBeLessThanOrEqual(1);
            expect(v).toBeGreaterThanOrEqual(-1);
          }
        }
      });
    });

    describe("fill", () => {
      it("can fill 2D arrays", () => {
        const p = new Noise.Color();
        const arr = Array(20)
          .fill(null)
          .map(() => Array(20).fill(0));

        p.fill(arr);

        arr.forEach((r) =>
          r.forEach((v) => {
            expect(v).toBeLessThanOrEqual(255);
            expect(v).toBeGreaterThanOrEqual(0);
          })
        );
      });

      it("can fill an ImageData", () => {
        // Polyfill for node environment
        if (!globalThis.ImageData) {
          // @ts-ignore
          globalThis.ImageData = class {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            colorSpace: "display-p3" | "srgb";

            constructor(sw: number, sh: number) {
              this.width = sw;
              this.height = sh;
              this.data = new Uint8ClampedArray(sw * sh * 4);
            }
          };
        }

        const p = new Noise.Color();
        const d = new ImageData(8, 8);
        p.fill(d);
        expect(Array.from(d.data)).toStrictEqual([
          128, 128, 128, 255, 127, 127, 127, 255, 124, 124, 124, 255, 105, 105,
          105, 255, 82, 82, 82, 255, 82, 82, 82, 255, 115, 115, 115, 255, 161,
          161, 161, 255, 66, 66, 66, 255, 74, 74, 74, 255, 97, 97, 97, 255, 121,
          121, 121, 255, 131, 131, 131, 255, 133, 133, 133, 255, 140, 140, 140,
          255, 161, 161, 161, 255, 49, 49, 49, 255, 61, 61, 61, 255, 103, 103,
          103, 255, 154, 154, 154, 255, 186, 186, 186, 255, 189, 189, 189, 255,
          177, 177, 177, 255, 177, 177, 177, 255, 96, 96, 96, 255, 96, 96, 96,
          255, 130, 130, 130, 255, 175, 175, 175, 255, 203, 203, 203, 255, 206,
          206, 206, 255, 190, 190, 190, 255, 181, 181, 181, 255, 160, 160, 160,
          255, 141, 141, 141, 255, 142, 142, 142, 255, 156, 156, 156, 255, 167,
          167, 167, 255, 168, 168, 168, 255, 160, 160, 160, 255, 157, 157, 157,
          255, 176, 176, 176, 255, 148, 148, 148, 255, 124, 124, 124, 255, 109,
          109, 109, 255, 103, 103, 103, 255, 102, 102, 102, 255, 107, 107, 107,
          255, 120, 120, 120, 255, 142, 142, 142, 255, 128, 128, 128, 255, 104,
          104, 104, 255, 77, 77, 77, 255, 57, 57, 57, 255, 54, 54, 54, 255, 73,
          73, 73, 255, 111, 111, 111, 255, 97, 97, 97, 255, 110, 110, 110, 255,
          112, 112, 112, 255, 97, 97, 97, 255, 75, 75, 75, 255, 63, 63, 63, 255,
          83, 83, 83, 255, 133, 133, 133, 255,
        ]);
      });
    });
  });

  describe("Worley", () => {
    describe("construct", () => {
      it("can construct a Worley generator", () => {
        const g = new Noise.Worley();
        expect(g).toBeDefined();
      });

      it("can construct with a prng", () => {
        const g = new Noise.Worley(new Random.Seedable(13));
        const f = new Noise.Worley(new Random.Seedable(13));
        expect(f.xy(2, 2)).toBe(g.xy(2, 2));
      });
    });
  });
});
