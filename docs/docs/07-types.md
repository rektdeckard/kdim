# Utility Types

## Tuple

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

## Vec

A convenience type equivalent to `Tuple<number, K extends number>`, useful for mathematical computation and data structures.

```ts
import { Vec } from "kdim";

const position: Vec<3> = [1.0, 69, 420];
const speed: Vec<3> = [-1, 3, 11];
const accel: Vec<3> = [0, 0, "no"]; // Error: type 'string' is not assignable to type 'number'
```
