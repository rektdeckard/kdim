# Assertions

## castInteger

Assert that a number (or object convertible to number) has no fractional part and is within the safe integer range, and cast it to a primitive number.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function castInteger<N extends Number>(n: N): number;
```

  </p>
</details>

```ts
import { castInteger, Wrapping } from "kdim";

const i = 300;
const u8 = new Wrapping({ max: 7 }, 5);
const f = 29.7;

const safeI = castInteger(i); // 300
const safeU8 = castInteger(u8); // 5
const errF = castInteger(f); // Error: Values must be safe integers
```

:::danger THROWS

Throws a RangeError if `n` has a fractional part, is not in safe integer range, or cannot be coerced from/to a number via `Number(n)` and `n.valueOf()`.

:::

## assertInteger

Assert that number(s) have no fractional part and are within the safe integer range.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function assertInteger(...numbers: number[]): void;
```

  </p>
</details>

```ts
import { assertInteger } from "kdim";

assertInteger(-300); // ok
assertInteger(1, 2, 10); // ok
assertInteger(7.89); // Error: Arguments must be integers
```

:::danger THROWS

Throws a RangeError if any `number` has a fractional part, or is not in safe integer range.

:::

## assertNatural

Assert that number(s) have no fractional part and are zero or greater.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function assertNatural(...numbers: number[]): void;
```

  </p>
</details>

```ts
import { assertNatural } from "kdim";

assertNatural(300); // ok
assertNatural(1, 2, 10); // ok
assertNatural(-1); // Error: Arguments must be natural numbers
```

:::danger THROWS

Throws a RangeError if any `number` has a fractional part, or is not zero or greater.

:::

## assertCounting

Assert that number(s) have no fractional part and are greater than zero.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function assertCounting(...numbers: number[]): void;
```

  </p>
</details>

```ts
import { assertCounting } from "kdim";

assertCounting(300); // ok
assertCounting(1, 2, 10); // ok
assertCounting(0); // Error: Arguments must be counting numbers
```

:::danger THROWS

Throws a RangeError if any `number` has a fractional part, or is not greater than zero.

:::

## assertValidRange

Assert that the arguments constitute a valid range, in which `min < max`, and, if present, `min <= value && value <= max`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function assertValidRange(min: number, max: number, value?: number): void;
```

  </p>
</details>

```ts
assertValidRange(0, 5);
assertValidRange(0, 5, 1);
assertValidRange(5, 0); // Error: Minimum must be less than maximum
assertValidRange(0, 5, 9); // Error: Value must be between minimum and maximum
```
