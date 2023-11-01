# KDTree

A time-efficient data structure for searching higher-dimensional datasets. Inspired by Mike Pound's [Computerphile Video](https://www.youtube.com/watch?v=BK5x7IUTIyU).

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class Node<T> {
  parent: Node<T> | null;
  point: T;
  left: Node<T> | null;
  right: Node<T> | null;

  constructor(point: T);
}

type KDTreeOptions = {
  clone?: boolean;
};

class KDTree<K extends number> implements Iterable<Vec<K>> {
  constructor(data?: Vec<K>[], options?: KDTreeOptions);

  get dimensions(): number;
  get tree(): Node<Vec<K>> | null;

  [Symbol.iterator](): Iterator<Vec<K>>;

  insert(point: Vec<K>): void;
  remove(point: Vec<K>): Vec<K> | null | void;
  has(point: Vec<K>): boolean;
  nearestNeighbor(point: Vec<K>): {
    point: Vec<K> | null;
    distance: number;
  };
}
```

  </p>
</details>

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

const { point, distance } = tree.nearestNeighbor(testPoint);
// { point: [1, 1, 1, 1, 1], distance: 1 }

tree.insert(testPoint);
tree.has(testPoint); // true

tree.remove(testPoint);
tree.has(testPoint); // false
```

:::tip INFO

by default, input datasets are shallowly copied during tree construction, and retained within the data structure. If desired, the underlying dataset may be used without copying, using the option `copy: false`;

:::
