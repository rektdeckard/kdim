# Comparator

A class used to determine ordering and equality of values of arbitrary types. A `Comparator` implements custom equality (`eq`) and ordering (`gt`, `gte`, `lt`, `lte`) for values based on the provided `CompareFunction`. If no function is provided, it defaults to the same lexical comparison used by `Array.prototype.sort`.

<details>
<summary>Class Signature</summary>
<p>

```ts
type CompareFunction<V> = (a: V, b: V) => number;

class Comparator<V> {
  constructor(compareFn?: CompareFunction<V>);

  static lexicalCompare<V>(a: V, b: V): 0 | 1 | -1;
  static reverseLexicalCompare<V>(a: V, b: V): 0 | 1 | -1;
  static numericCompare<V extends Number = number>(a: V, b: V): number;
  static reverseNumericCompare<V extends Number = number>(a: V, b: V): number;

  eq(a: V, b: V): boolean;
  gt(a: V, b: V): boolean;
  gte(a: V, b: V): boolean;
  lt(a: V, b: V): boolean;
  lte(a: V, b: V): boolean;
}
```

  </p>
</details>

## CompareFunction

The `CompareFunction` type is similar to the callback passed to `Array.prototype.sort`, in that it is called with two arguments `a` and `b`, and returns a number determining if `a` should be sorted before `b` (negative number), after `b` (positive number), or equal to `b` (0). The `Comparator` class has a number of built-in static `CompareFunction`s for ordering primitives.

```ts
import { Comparator } from "kdim";

// Using built-in CompareFunctions for sorting
const ns = [12, 5, 80, 3, -1];
const descendingOrder = ns.sort(Comparator.reverseNumericCompare);
// [80, 12, 5, 3, -1]

const words = ["hi", "there", "friends"];
const descendingWordOrder = words.sort(Comparator.reverseLexicalCompare);
// ["there", "friends", "hi"]
```

## Comparator of a complex type

```ts
// Compare non-primitive values by comparing their primitive properties
const quzComp = new Comparator<{ quz: number }>((a, b) => {
  return Comparator.numericCompare(a.quz, b.quz);
});

quzComp.eq({ quz: 7 }, { quz: 7 }); // true
quzComp.lt({ quz: 7 }, { quz: 3 }); // true
quzComp.gte({ quz: 1 }, { quz: -20 }); // false
```

## Comparator for values of multiple types

```ts
type A = { id: number; tag: string };
type B = { id: number; foo: string };

// As and Bs are considered equal if their ids and string part match,
// otherwise they are ordered first by id then by string part.
const abComp = new Comparator<A | B>((first, second) => {
  if (first.id === second.id) {
    const firstStr = (first as A).tag || (first as B).foo;
    const secondStr = (second as A).tag || (second as B).foo;
    return Comparator.lexicalCompare(firstStr, secondStr);
  } else {
    return first.id - second.id;
  }
});

abComp.eq({ id: 1, tag: "cool" }, { id: 1, foo: "bad" }); // false
abComp.eq({ id: 1, tag: "cool" }, { id: 1, foo: "cool" }); // true
abComp.gt({ id: 1, tag: "cool" }, { id: 1, tag: "neat" }); // true
abComp.lte({ id: 5, tag: "ok" }, { id: 99, tag: "neat" }); // false
```
