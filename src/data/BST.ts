import { Comparator, type CompareFunction } from "./Comparator";

export class BSTNode<V> {
  value: V;
  left?: BSTNode<V> | null;
  right?: BSTNode<V> | null;
  parent?: BSTNode<V> | null;

  constructor(data: V, parent?: BSTNode<V>) {
    this.value = data;
    this.parent = parent;
  }

  asBST(): BST<V> {
    return BST.fromNode(this);
  }
}

export class BST<V> implements Iterable<V> {
  #root: BSTNode<V> | null = null;
  #comparator: Comparator<V>;

  constructor(compareFn?: CompareFunction<V>) {
    this.#comparator = new Comparator(compareFn);
  }

  static fromNode<V>(node: BSTNode<V>) {
    const tree = new BST<V>();
    tree.#root = node;
    return tree;
  }

  search(value: V): BSTNode<V> | null {
    const searchImpl = (
      subtree: BSTNode<V> | null | undefined
    ): BSTNode<V> | null => {
      if (!subtree) return null;
      if (this.#comparator.eq(subtree.value, value)) return subtree;

      if (this.#comparator.lt(subtree.value, value)) {
        return searchImpl(subtree.left);
      } else {
        return searchImpl(subtree.right);
      }
    };

    return searchImpl(this.#root);
  }

  insert(value: V): boolean {
    if (!this.#root) {
      this.#root = new BSTNode(value);
      return false;
    }

    const insertImpl = (subtree: BSTNode<V>): boolean => {
      if (this.#comparator.eq(subtree.value, value)) {
        subtree.value = value;
        return true;
      }

      if (this.#comparator.lt(subtree.value, value)) {
        if (!subtree.left) {
          subtree.left = new BSTNode(value, subtree);
          return false;
        }
        return insertImpl(subtree.left);
      } else {
        if (!subtree.right) {
          subtree.right = new BSTNode(value, subtree);
          return false;
        }
        return insertImpl(subtree.right);
      }
    };

    return insertImpl(this.#root);
  }

  has(value: V): boolean {
    return !!this.search(value);
  }

  delete(valueOrNode: V | BSTNode<V>): boolean {
    const shiftNodes = (
      subtree: BSTNode<V>,
      descendant: BSTNode<V> | null | undefined = null
    ) => {
      if (!subtree.parent) {
        this.#root = descendant;
      } else if (subtree === subtree.parent.left) {
        subtree.parent.left = descendant;
      } else {
        subtree.parent.right = descendant;
      }

      if (descendant) {
        descendant.parent = subtree.parent;
      }
    };

    const deleteNode = (node: BSTNode<V>): boolean => {
      if (!node.left) {
        shiftNodes(node, node.right);
        return true;
      } else if (!node.right) {
        shiftNodes(node, node.left);
        return true;
      } else {
        let succ = this.successor(node)!;
        if (succ.parent !== node) {
          shiftNodes(succ, succ.right);
          succ.right = node.right;
          succ.right.parent = succ;
        }
        shiftNodes(node, succ);
        succ.left = node.left;
        succ.left.parent = succ;
        return true;
      }

      return false;
    };

    if (valueOrNode instanceof BSTNode) {
      if (this.has(valueOrNode.value)) {
        return deleteNode(valueOrNode);
      }
    } else {
      const node = this.search(valueOrNode);
      if (node) {
        return deleteNode(node);
      }
    }

    return false;
  }

  max(node?: BSTNode<V>): BSTNode<V> | null {
    let current = node ?? this.#root;
    while (current?.right) {
      current = current.right;
    }

    return current ?? null;
  }

  min(node?: BSTNode<V>): BSTNode<V> | null {
    let current = node ?? this.#root;
    while (current?.left) {
      current = current.left;
    }

    return current ?? null;
  }

  successor(node: BSTNode<V>): BSTNode<V> | null {
    if (node.right) {
      return this.min(node.right);
    }

    let prev = node;
    let current = node.parent;
    while (current && prev === current.right) {
      prev = current;
      current = current.parent;
    }

    return current ?? null;
  }

  predecessor(node: BSTNode<V>): BSTNode<V> | null {
    if (node.left) {
      return this.max(node.left);
    }

    let prev = node;
    let current = node.parent;
    while (current && prev === current.left) {
      prev = current;
      current = current.parent;
    }

    return current ?? null;
  }

  asOrdered(): V[] {
    const arr: V[] = [];

    const inOrderImpl = (subtree: BSTNode<V> | null | undefined) => {
      if (!subtree) return;
      inOrderImpl(subtree.left);
      arr.push(subtree.value);
      inOrderImpl(subtree.right);
    };

    inOrderImpl(this.#root);

    return arr;
  }

  asPreOrdered(): V[] {
    const arr: V[] = [];

    const preOrderImpl = (subtree: BSTNode<V> | null | undefined) => {
      if (!subtree) return;
      arr.push(subtree.value);
      preOrderImpl(subtree.left);
      preOrderImpl(subtree.right);
    };

    preOrderImpl(this.#root);

    return arr;
  }

  asPostOrdered(): V[] {
    const arr: V[] = [];

    const postOrderImpl = (subtree: BSTNode<V> | null | undefined) => {
      if (!subtree) return;
      postOrderImpl(subtree.left);
      postOrderImpl(subtree.right);
      arr.push(subtree.value);
    };

    postOrderImpl(this.#root);

    return arr;
  }

  *[Symbol.iterator]() {
    function* inOrderImpl(
      subtree: BSTNode<V> | null | undefined
    ): IterableIterator<V> {
      if (!subtree) return;
      yield* inOrderImpl(subtree.left);
      yield subtree.value;
      yield* inOrderImpl(subtree.right);
    }

    yield* inOrderImpl(this.#root);
  }
}
