import { uncheckedLerp } from "./transforms";

const MAX_ENTROPY = 2 ** 16;

export type TypedArrayNoiseTarget = {
  data: Uint8ClampedArray;
  width: number;
  stride: number;
};

export type NoiseTarget = ImageData | number[][] | TypedArrayNoiseTarget;

type Noise2DFillOptions = {
  z?: never;
};

type Noise3DFillOptions = {
  z: number;
};

export type NoiseFillOptions = {
  freq?: number;
  set?: (cell: { x: number; y: number; z: number; v: number }) => void;
} & (Noise2DFillOptions | Noise3DFillOptions);

export type EasingFunction = (value: number) => number;

function scale(v: number) {
  return (v + 1) / 2;
}

function fillConfig(
  target: NoiseTarget,
  { freq = 1, set }: NoiseFillOptions = {}
): {
  width: number;
  height: number;
  freq: number;
  setCell: (cell: { x: number; y: number; z: number; v: number }) => void;
  typedArray?: Uint8ClampedArray;
} {
  return "ImageData" in globalThis && target instanceof ImageData
    ? {
        width: target.width,
        height: target.height,
        freq,
        typedArray: target.data,
        setCell:
          set ??
          (({ x, y, v }) => {
            const cell = (x + y * target.width) * 4;
            target.data[cell] =
              target.data[cell + 1] =
              target.data[cell + 2] =
                v;
            target.data[cell + 3] = 255; // alpha
          }),
      }
    : Array.isArray(target)
    ? {
        width: target[0].length,
        height: target.length,
        freq,
        setCell:
          set ??
          (({ x, y, v }) => {
            target[y][x] = v; // FIXME
          }),
      }
    : {
        width: target.width,
        height:
          target.data.length /
          target.width /
          (target as TypedArrayNoiseTarget).stride,
        freq,
        typedArray: (target as TypedArrayNoiseTarget).data,
        setCell:
          set ??
          (({ x, y, v }) => {
            const cell =
              (x + y * target.width) * (target as TypedArrayNoiseTarget).stride;
            target.data[cell] =
              target.data[cell + 1] =
              target.data[cell + 2] =
                v;
            target.data[cell + 3] = 255; // alpha
          }),
      };
}

abstract class NoiseGenerator {
  abstract seed(seed: number): this;
  abstract xy(x: number, y: number): number;
  abstract xyz(x: number, y: number, z: number): number;
  abstract fill(target: NoiseTarget, options?: NoiseFillOptions): void;
}

class Gradient {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }

  dot3(x: number, y: number, z: number) {
    return this.x * x + this.y * y + this.z * z;
  }
}

const PERMUTATION: ReadonlyArray<number> = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

const GRAD_3: ReadonlyArray<Gradient> = [
  new Gradient(1, 1, 0),
  new Gradient(-1, 1, 0),
  new Gradient(1, -1, 0),
  new Gradient(-1, -1, 0),
  new Gradient(1, 0, 1),
  new Gradient(-1, 0, 1),
  new Gradient(1, 0, -1),
  new Gradient(-1, 0, -1),
  new Gradient(0, 1, 1),
  new Gradient(0, -1, 1),
  new Gradient(0, 1, -1),
  new Gradient(0, -1, -1),
];

class Perlin implements NoiseGenerator {
  #perm: number[];
  #grads: Gradient[];
  #ease: EasingFunction = Perlin.quintic;

  static linear(t: number) {
    return t;
  }

  static cubic(t: number) {
    return (3.0 - t * 2.0) * t * t;
  }

  static quintic(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  constructor(seed: number = Math.random()) {
    this.#perm = new Array(512);
    this.#grads = new Array(512);
    this.seed(seed);
  }

  ease(easingFn: EasingFunction): this {
    this.#ease = easingFn;
    return this;
  }

  seed(seed: number): this {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    for (let i = 0; i < 256; i++) {
      let v: number;
      if (i & 1) {
        v = PERMUTATION[i] ^ (seed & 255);
      } else {
        v = PERMUTATION[i] ^ ((seed >> 8) & 255);
      }

      this.#perm[i] = this.#perm[i + 256] = v;
      this.#grads[i] = this.#grads[i + 256] = GRAD_3[v % 12];
    }

    return this;
  }

  xy(x: number, y: number): number {
    // Find unit grid cell containing point
    let cx = Math.floor(x);
    let cy = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    const dx = x - cx;
    const dy = y - cy;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    cx = cx & 255;
    cy = cy & 255;

    // Calculate noise contributions from each of the four corners
    const n00 = this.#grads[cx + this.#perm[cy]].dot2(dx, dy);
    const n01 = this.#grads[cx + this.#perm[cy + 1]].dot2(dx, dy - 1);
    const n10 = this.#grads[cx + 1 + this.#perm[cy]].dot2(dx - 1, dy);
    const n11 = this.#grads[cx + 1 + this.#perm[cy + 1]].dot2(dx - 1, dy - 1);

    // Compute the fade curve value for x
    const u = this.#ease(dx);

    // Interpolate the four results
    return uncheckedLerp(
      uncheckedLerp(n00, n10, u),
      uncheckedLerp(n01, n11, u),
      this.#ease(dy)
    );
  }

  xyz(x: number, y: number, z: number): number {
    // Find unit grid cell containing point
    let cx = Math.floor(x);
    let cy = Math.floor(y);
    let cz = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    const dx = x - cx;
    const dy = y - cy;
    const dz = z - cz;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    cx = cx & 255;
    cy = cy & 255;
    cz = cz & 255;

    // Calculate noise contributions from each of the eight corners
    const n000 = this.#grads[cx + this.#perm[cy + this.#perm[cz]]].dot3(
      dx,
      dy,
      dz
    );
    const n001 = this.#grads[cx + this.#perm[cy + this.#perm[cz + 1]]].dot3(
      dx,
      dy,
      dz - 1
    );
    const n010 = this.#grads[cx + this.#perm[cy + 1 + this.#perm[cz]]].dot3(
      dx,
      dy - 1,
      dz
    );
    const n011 = this.#grads[cx + this.#perm[cy + 1 + this.#perm[cz + 1]]].dot3(
      dx,
      dy - 1,
      dz - 1
    );
    const n100 = this.#grads[cx + 1 + this.#perm[cy + this.#perm[cz]]].dot3(
      dx - 1,
      dy,
      dz
    );
    const n101 = this.#grads[cx + 1 + this.#perm[cy + this.#perm[cz + 1]]].dot3(
      dx - 1,
      dy,
      dz - 1
    );
    const n110 = this.#grads[cx + 1 + this.#perm[cy + 1 + this.#perm[cz]]].dot3(
      dx - 1,
      dy - 1,
      dz
    );
    const n111 = this.#grads[
      cx + 1 + this.#perm[cy + 1 + this.#perm[cz + 1]]
    ].dot3(dx - 1, dy - 1, dz - 1);

    // Compute the fade curve value for x, y, z
    const u = this.#ease(dx);
    const v = this.#ease(dy);
    const w = this.#ease(dz);

    // Interpolate
    return uncheckedLerp(
      uncheckedLerp(
        uncheckedLerp(n000, n100, u),
        uncheckedLerp(n001, n101, u),
        w
      ),
      uncheckedLerp(
        uncheckedLerp(n010, n110, u),
        uncheckedLerp(n011, n111, u),
        w
      ),
      v
    );
  }

  fill(target: NoiseTarget, options?: NoiseFillOptions): void {
    const { width, height, freq, setCell } = fillConfig(target, options);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const sx = x / (width / freq);
        const sy = y / (width / freq);
        const v =
          options?.z !== undefined
            ? this.xyz(sx, sy, options?.z)
            : this.xy(sx, sy);

        const scaled = uncheckedLerp(0, 255, scale(v));
        setCell({ x, y, z: options?.z ?? 0, v: scaled });
      }
    }
  }
}

class Simplex implements NoiseGenerator {
  #perm: number[];
  #grads: Gradient[];

  constructor(seed: number = Math.random()) {
    this.#perm = new Array(512);
    this.#grads = new Array(512);
    this.seed(seed);
  }

  static #F2 = 0.5 * (Math.sqrt(3) - 1);
  static #G2 = (3 - Math.sqrt(3)) / 6;
  static #F3 = 1 / 3;
  static #G3 = 1 / 6;

  seed(seed: number): this {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    for (let i = 0; i < 256; i++) {
      let v: number;
      if (i & 1) {
        v = PERMUTATION[i] ^ (seed & 255);
      } else {
        v = PERMUTATION[i] ^ ((seed >> 8) & 255);
      }

      this.#perm[i] = this.#perm[i + 256] = v;
      this.#grads[i] = this.#grads[i + 256] = GRAD_3[v % 12];
    }

    return this;
  }

  xy(x: number, y: number): number {
    let n0: number, n1: number, n2: number; // Noise contributions from the three corners

    // Skew the input space to determine which simplex cell we're in
    const s = (x + y) * Simplex.#F2; // Hairy factor for 2D
    let i = Math.floor(x + s);
    let j = Math.floor(y + s);
    const t = (i + j) * Simplex.#G2;
    const x0 = x - i + t; // The x,y distances from the cell origin, unskewed.
    const y0 = y - j + t;

    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1: number, j1: number; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1 = 1;
      j1 = 0;
    } else {
      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1 = 0;
      j1 = 1;
    }

    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + Simplex.#G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + Simplex.#G2;
    const x2 = x0 - 1 + 2 * Simplex.#G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1 + 2 * Simplex.#G2;

    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    const gi0 = this.#grads[i + this.#perm[j]];
    const gi1 = this.#grads[i + i1 + this.#perm[j + j1]];
    const gi2 = this.#grads[i + 1 + this.#perm[j + 1]];

    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  }

  xyz(x: number, y: number, z: number): number {
    let n0: number, n1: number, n2: number, n3: number; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    const s = (x + y + z) * Simplex.#F3; // Hairy factor for 2D
    let i = Math.floor(x + s);
    let j = Math.floor(y + s);
    let k = Math.floor(z + s);

    const t = (i + j + k) * Simplex.#G3;
    const x0 = x - i + t; // The x,y distances from the cell origin, unskewed.
    const y0 = y - j + t;
    const z0 = z - k + t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }

    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    const x1 = x0 - i1 + Simplex.#G3; // Offsets for second corner
    const y1 = y0 - j1 + Simplex.#G3;
    const z1 = z0 - k1 + Simplex.#G3;

    const x2 = x0 - i2 + 2 * Simplex.#G3; // Offsets for third corner
    const y2 = y0 - j2 + 2 * Simplex.#G3;
    const z2 = z0 - k2 + 2 * Simplex.#G3;

    const x3 = x0 - 1 + 3 * Simplex.#G3; // Offsets for fourth corner
    const y3 = y0 - 1 + 3 * Simplex.#G3;
    const z3 = z0 - 1 + 3 * Simplex.#G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    const gi0 = this.#grads[i + this.#perm[j + this.#perm[k]]];
    const gi1 = this.#grads[i + i1 + this.#perm[j + j1 + this.#perm[k + k1]]];
    const gi2 = this.#grads[i + i2 + this.#perm[j + j2 + this.#perm[k + k2]]];
    const gi3 = this.#grads[i + 1 + this.#perm[j + 1 + this.#perm[k + 1]]];

    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);
  }

  fill(target: NoiseTarget, options?: NoiseFillOptions): void {
    const { width, height, freq, setCell } = fillConfig(target, options);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const sx = x / (width / freq);
        const sy = y / (width / freq);
        const v =
          options?.z !== undefined
            ? this.xyz(sx, sy, options?.z)
            : this.xy(sx, sy);

        const scaled = uncheckedLerp(0, 255, scale(v));
        setCell({ x, y, z: options?.z ?? 0, v: scaled });
      }
    }
  }
}

// class Color implements NoiseGenerator {
//   constructor() {}

//   seed(seed: number): this {
//     return this;
//   }

//   xy(_x: number, _y: number): number {
//     return uncheckedLerp(-1, 1, Math.random());
//   }

//   xyz(x: number, y: number, _z: number): number {
//     return this.xy(x, y);
//   }

//   fill(target: NoiseTarget, options?: NoiseFillOptions): void {
//     const { width, height, freq, setCell, typedArray } = fillConfig(
//       target,
//       options
//     );

//     if (typedArray) {
//       const cycles = Math.ceil(typedArray.byteLength / MAX_ENTROPY);

//       if (cycles === 1) {
//         crypto.getRandomValues(typedArray);
//       } else {
//         for (let i = 0; i < cycles; i++) {
//           crypto.getRandomValues(
//             typedArray.slice(i * MAX_ENTROPY, (i + 1) * MAX_ENTROPY)
//           );
//         }
//       }
//     } else {
//       throw new Error("NOT IMPLEMENTED");
//     }

//     // for (let x = 0; x < width; x++) {
//     //   for (let y = 0; y < height; y++) {
//     //     const sx = x / (width / freq);
//     //     const sy = y / (width / freq);
//     //     const v =
//     //       options?.z !== undefined
//     //         ? this.xyz(sx, sy, options?.z)
//     //         : this.xy(sx, sy);

//     //     const scaled = uncheckedLerp(0, 255, scale(v));
//     //     setCell({ x, y, z: options?.z ?? 0, v: scaled });
//     //   }
//     // }
//   }
// }

export const Noise = {
  Perlin,
  Simplex,
//   Color,
} as const;
