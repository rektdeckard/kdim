export type NodeKey = string | number | boolean;

export class BSTNode<K extends NodeKey, V> {
  key: K;
  value: V;
  left?: BSTNode<K, V> | null;
  right?: BSTNode<K, V> | null;
  parent?: BSTNode<K, V> | null;

  constructor(key: K, data: V, parent?: BSTNode<K, V>) {
    this.key = key;
    this.value = data;
    this.parent = parent;
  }

  asBST(): BST<K, V> {
    return BST.fromNode(this);
  }
}

export class BST<K extends NodeKey, V> implements Iterable<[key: K, data: V]> {
  #root: BSTNode<K, V> | null = null;

  // #comparator: (a: K | V, b: K | V) => number = (a, b) =>
  //   a === b ? 0 : a > b ? 1 : -1;

  static fromNode<K extends NodeKey, V>(node: BSTNode<K, V>) {
    const tree = new BST<K, V>();
    tree.#root = node;
    return tree;
  }

  search(key: K): BSTNode<K, V> | null {
    const searchImpl = (
      subtree: BSTNode<K, V> | null | undefined
    ): BSTNode<K, V> | null => {
      if (subtree?.key === undefined) return null;
      if (subtree.key === key) return subtree;

      if (key < subtree.key) {
        return searchImpl(subtree.left);
      } else {
        return searchImpl(subtree.right);
      }
    };

    return searchImpl(this.#root);
  }

  insert(key: K, value: V): boolean {
    if (!this.#root) {
      this.#root = new BSTNode(key, value);
      return false;
    }

    const insertImpl = (subtree: BSTNode<K, V>): boolean => {
      if (subtree.key === key) {
        subtree.value = value;
        return true;
      }

      if (key < subtree.key) {
        if (!subtree.left) {
          subtree.left = new BSTNode(key, value, subtree);
          return false;
        }
        return insertImpl(subtree.left);
      } else {
        if (!subtree.right) {
          subtree.right = new BSTNode(key, value, subtree);
          return false;
        }
        return insertImpl(subtree.right);
      }
    };

    return insertImpl(this.#root);
  }

  has(key: K): boolean {
    return !!this.search(key);
  }

  delete(keyOrNode: K | BSTNode<K, V>): boolean {
    const shiftNodes = (
      subtree: BSTNode<K, V>,
      descendant: BSTNode<K, V> | null | undefined = null
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

    const deleteNode = (node: BSTNode<K, V>): boolean => {
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

    if (typeof keyOrNode === "object") {
      if (this.has(keyOrNode.key)) {
        return deleteNode(keyOrNode);
      }
    } else {
      const node = this.search(keyOrNode);
      if (node) {
        return deleteNode(node);
      }
    }

    return false;
  }

  max(node?: BSTNode<K, V>): BSTNode<K, V> | null {
    let current = node ?? this.#root;
    while (current?.right) {
      current = current.right;
    }

    return current ?? null;
  }

  min(node?: BSTNode<K, V>): BSTNode<K, V> | null {
    let current = node ?? this.#root;
    while (current?.left) {
      current = current.left;
    }

    return current ?? null;
  }

  successor(node: BSTNode<K, V>): BSTNode<K, V> | null {
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

  predecessor(node: BSTNode<K, V>): BSTNode<K, V> | null {
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

  asOrdered(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    const inOrderImpl = (subtree: BSTNode<K, V> | null | undefined) => {
      if (!subtree) return;
      inOrderImpl(subtree.left);
      arr.push([subtree.key, subtree.value]);
      inOrderImpl(subtree.right);
    };

    inOrderImpl(this.#root);

    return arr;
  }

  asPreOrdered(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    const preOrderImpl = (subtree: BSTNode<K, V> | null | undefined) => {
      if (!subtree) return;
      arr.push([subtree.key, subtree.value]);
      preOrderImpl(subtree.left);
      preOrderImpl(subtree.right);
    };

    preOrderImpl(this.#root);

    return arr;
  }

  asPostOrdered(): [key: K, value: V][] {
    const arr: [key: K, value: V][] = [];

    const postOrderImpl = (subtree: BSTNode<K, V> | null | undefined) => {
      if (!subtree) return;
      postOrderImpl(subtree.left);
      postOrderImpl(subtree.right);
      arr.push([subtree.key, subtree.value]);
    };

    postOrderImpl(this.#root);

    return arr;
  }

  [Symbol.iterator]() {
    return this.asOrdered()[Symbol.iterator]();
  }
}
