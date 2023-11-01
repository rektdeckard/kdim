# BST

A simple binary search tree for time-efficient search or arbitrary data.

<details>
  <summary>Class Signature</summary>
  <p>

```ts
class BSTNode<V> {
  constructor(data: V, parent?: BSTNode<V>);
  asBST(): BST<V>;
}

class BST<V> implements Iterable<V> {
  constructor(compareFn?: CompareFunction<V>);

  static fromNode<V>(node: BSTNode<V>): BST<V>;

  search(value: V): BSTNode<V> | null;
  insert(value: V): boolean;
  has(value: V): boolean;
  delete(valueOrNode: V | BSTNode<V>): boolean;
  max(node?: BSTNode<V>): BSTNode<V> | null;
  min(node?: BSTNode<V>): BSTNode<V> | null;
  successor(node: BSTNode<V>): BSTNode<V> | null;
  predecessor(node: BSTNode<V>): BSTNode<V> | null;

  asOrdered(): V[];
  asPreOrdered(): V[];
  asPostOrdered(): V[];

  *[Symbol.iterator](): IterableIterator<V>;
}
```

  </p>
</details>

```ts
import { BST, CompareFunction } from "kdim";

type Person = { name: string; age: number };

const comp: CompareFunction<Person> = (a, b) =>
  a.name === b.name ? a.age - b.age : a > b ? 1 : -1;

const tree = new BST<Person>(comp);
tree.insert({ name: "Cillian Murphy", age: 47 });
tree.insert({ name: "Emily Blunt", age: 40 });
```
