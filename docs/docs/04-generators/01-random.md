# Random

Produce random values of common numeric and other types (E.G. `u8`, `integer`, `bool`), sample and shuffle `Array`s and `Set`s of values, and determine characteristics of those sets.

<details>
  <summary>Class Signature</summary>

```ts
class Random {
  static bool(): boolean;
  static natural(max?: number): number;
  static counting(max?: number): number;
  static integer(opts?: { min?: number; max?: number }): number;
  static float(opts?: { min?: number; max?: number }): number;
  static dice(sides: number): number;
  static u8(): number;
  static u16(): number;
  static u32(): number;
  static i8(): number;
  static i16(): number;
  static i32(): number;

  static unitVector<N extends number>(n: N): Vec<N>;

  static sample<T>(options: T[] | Set<T>): T | undefined;
  static take<T>(options: T[] | Set<T>): T | undefined;
  static permute<T>(array: T[]): void;
  static permutation<T>(array: T[]): T[];
  static permutationsOf(set: number | Array<unknown> | Set<unknown>): number;
  static derange<T>(array: T[]): void;
  static derangement<T>(array: T[]): T[];
  static derangementsOf(set: number | Array<unknown> | Set<unknown>): number;
}
```

</details>

```ts
import { Random } from "kdim";

// Generate values
const trueOrFalse = Random.bool();
const volume = Random.integer({ max: 11 });
const attackRoll = Random.dice(20);

// Sample lists and sets
const adjectives = ["harder", "better", "faster", "stronger"];
const doIt = Random.sample(adjectives);

const cookieJar = new Set(["chocolate chip", "oatmeal", "macadamia"]);
const eaten = Random.take(cookieJar); // "macadamia" maybe?
cookieJar.has(eaten); // false

// Shuffle lists
const code = [13, 17, 29, 42];
const shuf = Random.permutation(code); // [29, 17, 13, 42] maybe?

const friends = ["alice", "bob", "carlos", "dan", "erin"];
const secretSantas = Random.derangement(friends); // Shuffled with no fixed points
Random.derangementsOf(friends); // 44: ways to match 5 people for secret santa
```

:::danger THROWS

Generators that take numeric arguments will throw if range is invalid (E.G. `min > max`), values are invalid (decimal number passed to integer generator), or other

:::
