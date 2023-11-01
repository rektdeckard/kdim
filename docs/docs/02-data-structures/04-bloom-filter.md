# BloomFilter

A probabalistic data structure used to test for membership of a large set in which storage of all set elements is unfeasible. False positives are possible, but false negatives are not, so that the structure will tell you if an element is either "probably in the set" or "definitely not in the set".

<details>
  <summary>Class Signature</summary>
  <p>

```ts
type HashFunction<T> = (data: T) => Promise<string> | string;

type BloomFilterOptions<T> = {
  size?: number;
  hashFunctions?: Array<HashFunction<T>>;
};

class BloomFilter<T = any> {
  constructor(options?: BloomFilterOptions<T>);
  static DEFAULT_HASH_FUNCTIONS: HashFunction<any>[]:
  async add(element: T): void;
  async test(element: T): boolean;
}
```

  </p>
</details>

```ts
import { BloomFilter } from "kdim";

const filter = new BloomFilter<{ name: string }>();
await filter.add({ name: "Julien Baker" });
await filter.add({ name: "Phoebe Bridgers" });
await filter.add({ name: "Lucy Dacus" });

await filter.test({ name: "Phoebe Bridgers" }); // true
await filter.test({ name: "Julia Jacklin" }); // false
```

:::tip INFO

By default, `BloomFilter` uses a set of object hashers that considers two objects to have the same hash if all their properties are equal, therefore will consider structurally identical objects equal.

:::