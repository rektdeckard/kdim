# Transforms

## clamp

Constrain a value to within a given range `[min, max]`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function clamp(min: number, max: number, value: number): number;
```

  </p>
</details>

```ts
import { clamp } from "kdim";

// Clamp values to [0, 255]
const a = 32;
const b = 300;

clamp(0, 255, a); // 32
clamp(0, 255, b); // 255
```

:::danger THROWS

Throws a RangeError when the range is invalid, E.G. `min > max`.

:::

## lerp

Linear interpolation of a value in the range `[0, 1]` to a value in the range `[from, to]`.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function lerp(from: number, to: number, value: number): number;
```

  </p>
</details>

```ts
import { lerp } from "kdim";

// Interpolate 0.4 in range [0,1] to range [1,99]
const value = 0.4;
const interpolated = lerp(1, 99, value); // 40.2
```

:::danger THROWS

Throws a RangeError when the value is outside of `[0, 1]`

:::

## gcf

Find the Greatest Common Factor of two integers.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function gcf(a: number, b: number): number;
```

  </p>
</details>

```ts
import { gcf } from "kdim";

gcf(45, 420); // 15
```

:::danger THROWS

Throws a RangeError when `a` or `b` are non-integral.

:::

## lcm

Find the Least Common Multiple of two integers.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function lcm(a: number, b: number): number;
```

  </p>
</details>

```ts
import { lcm } from "kdim";

lcm(6, 20); // 60
```

:::danger THROWS

Throws a RangeError when `a` or `b` are non-integral.

:::

## trailingZeros

Compute the number of trailing zeros in a number's 32-bit representation, equivalent to its largest power-of-two divisor.

<details>
  <summary>Function Signature</summary>
  <p>

```ts
function trailingZeros(n: number): number;
```

  </p>
</details>

```ts
import { trailingZeros } from "kdim";

trailingZeros(24); // 3
```

:::danger THROWS

Throws a RangeError when `n` is non-integral.

:::
