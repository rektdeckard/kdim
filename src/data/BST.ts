export type NodeKey = string | number | boolean;

class BSTNode<K extends NodeKey, D> {
  key: K;
  value: D;
  left?: BSTNode<K, D>;
  right?: BSTNode<K, D>;

  constructor(key: K, data: D) {
    this.key = key;
    this.value = data;
  }
}

export class BST<K extends NodeKey, V> implements Iterable<[key: K, data: V]> {
  #root: BSTNode<K, V> | null = null;
  // #comparator: (a: K | V, b: K | V) => number = (a, b) =>
  //   a === b ? 0 : a > b ? 1 : -1;

  constructor() {}

  search(key: K): BSTNode<K, V> | null {
    function searchImpl(
      subtree: BSTNode<K, V> | null | undefined
    ): BSTNode<K, V> | null {
      if (subtree?.key === undefined) return null;
      if (subtree.key === key) return subtree;

      if (key < subtree.key) {
        return searchImpl(subtree.left);
      } else {
        return searchImpl(subtree.right);
      }
    }

    return searchImpl(this.#root);
  }

  insert(key: K, value: V): boolean {
    if (!this.#root) {
      this.#root = new BSTNode(key, value);
      return false;
    }

    function insertImpl(subtree: BSTNode<K, V>): boolean {
      if (subtree.key === key) {
        subtree.value = value;
        return true;
      }

      if (key < subtree.key) {
        if (!subtree.left) {
          subtree.left = new BSTNode(key, value);
          return false;
        }
        return insertImpl(subtree.left);
      } else {
        if (!subtree.right) {
          subtree.right = new BSTNode(key, value);
          return false;
        }
        return insertImpl(subtree.right);
      }
    }

    return insertImpl(this.#root);
  }

  delete(key: K): boolean {
    return false;
  }

  max(): [key: K, value: V] | null {
    return null;
  }

  min(): [key: K, value: V] | null {
    return null;
  }

  inOrder(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    function inOrderImpl(subtree: BSTNode<K, V> | null | undefined) {
      if (!subtree) return;
      inOrderImpl(subtree.left);
      arr.push([subtree.key, subtree.value]);
      inOrderImpl(subtree.right);
    }

    inOrderImpl(this.#root);

    return arr;
  }

  preOrder(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    function preOrderImpl(subtree: BSTNode<K, V> | null | undefined) {
      if (!subtree) return;
      arr.push([subtree.key, subtree.value]);
      preOrderImpl(subtree.left);
      preOrderImpl(subtree.right);
    }

    preOrderImpl(this.#root);

    return arr;
  }

  postOrder(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    function postOrderImpl(subtree: BSTNode<K, V> | null | undefined) {
      if (!subtree) return;
      postOrderImpl(subtree.left);
      postOrderImpl(subtree.right);
      arr.push([subtree.key, subtree.value]);
    }

    postOrderImpl(this.#root);

    return arr;
  }

  [Symbol.iterator]() {
    return this.inOrder()[Symbol.iterator]();
  }
}
