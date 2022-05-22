# kdim

A collection of interesting data structures and utility types for messing around with mathematical things in Node/JS/TS. No guarantees are made here as to the speed, efficiency, or correctness of tools providied!

[![NPM](https://img.shields.io/npm/v/kdim.svg?style=flat-square)](https://www.npmjs.com/package/kdim)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/kdim?style=flat-square)

[![GitHub stars](https://img.shields.io/github/stars/rektdeckard/kdim?style=flat-square&label=Star)](https://github.com/rektdeckard/kdim)
[![GitHub forks](https://img.shields.io/github/forks/rektdeckard/kdim?style=flat-square&label=Fork)](https://github.com/rektdeckard/kdim/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/rektdeckard/kdim?style=flat-square&label=Watch)](https://github.com/rektdeckard/kdim)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

```bash
yarn add kdim
```

or

```bash
npm install --save kdim
```

---

## Utility Types

### Tuple

A typed tuple of generic length.

```ts
import { Tuple } from "kdim";

const threeBoolTuple: Tuple<boolean, 3> = [true, false, false];
const wrongBoolTuple: Tuple<boolean, 3> = [false, true]; // Error: Source has 2 element(s) but target requires 3
```

This also composes to allow for strongly-typed multidimensional arrays, such as a chess board:

```ts
import { Tuple } from "kdim";

type Piece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type Board = Tuple<Tuple<Piece | null, 8>, 8>;

const board: Board = [
  ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
];
```

### Vec

A convenience type equivalent to `Tuple<number, K>`, useful for mathematical computation and data structures.

```ts
import { Vec } from "kdim";

const position: Vec<3> = [1.0, 69, 420];
const speed: Vec<3> = [-1, 3, 11];
const accel: Vec<3> = [0, 0, "no"]; // Error: type 'string' is not assignable to type 'number'
```

---

## Data Structures

### KDTree

A time-efficient data structure for searching higher-dimensional datasets. Inspired by Mike Pound's [Comupterphile Video](https://www.youtube.com/watch?v=BK5x7IUTIyU).

```ts
import { Vec, KDTree } from "kdim";

const data: Vec<5>[] = [
  [0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0],
];

const tree = new KDTree<5>(data);
const testPoint: Vec<5> = [1, 0, 1, 1, 1];

tree.has(testPoint); // false

const { point, distance } = tree.nearestNeighbor(testPoint); // { point: [1, 1, 1, 1, 1], distance: 1 }

tree.insert(testPoint);
tree.has(testPoint); // true

tree.remove(testPoint);
tree.has(testPoint); // false
```

> Note: by default, input datasets are shallowly copied during tree construction, and retained within the data structure. If desired, the underlying dataset may be used without copying, using the option `copy: false`;

---

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
