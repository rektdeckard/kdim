export type NodeKey = string | number | boolean;

class BSTNode<D> {
  key: NodeKey;
  data: D;
  left?: BSTNode<D>;
  right?: BSTNode<D>;

  constructor(key: NodeKey, data: D) {
    this.key = key;
    this.data = data;
  }
}

export class BST<K extends NodeKey, D> implements Iterable<D> {
  #root: BSTNode<D> | null = null;

  constructor() {}

  search(key: K) {
    function findImpl(subtree: BSTNode<D> | null | undefined): D | null {
      if (subtree?.key === undefined) return null;
      if (subtree.key === key) return subtree.data;

      if (key < subtree.key) {
        return findImpl(subtree.left);
      } else {
        return findImpl(subtree.right);
      }
    }

    return findImpl(this.#root);
  }

  insert(key: K, data: D): boolean {
    if (!this.#root) {
      this.#root = new BSTNode(key, data);
      return false;
    }

    function insertImpl(subtree: BSTNode<D>): boolean {
      if (subtree.key === key) {
        subtree.data = data;
        return true;
      }

      if (key < subtree.key) {
        if (!subtree.left) {
          subtree.left = new BSTNode(key, data);
          return false;
        }
        return insertImpl(subtree.left);
      } else {
        if (!subtree.right) {
          subtree.right = new BSTNode(key, data);
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

  inOrder(): D[] {
    const arr: D[] = [];

    function inOrderImpl(subtree: BSTNode<D> | null | undefined) {
      if (!subtree) return;
      inOrderImpl(subtree.left);
      arr.push(subtree.data);
      inOrderImpl(subtree.right);
    }

    inOrderImpl(this.#root);

    return arr;
  }

  preOrder(): D[] {
    const arr: D[] = [];

    function preOrderImpl(subtree: BSTNode<D> | null | undefined) {
      if (!subtree) return;
      arr.push(subtree.data);
      preOrderImpl(subtree.left);
      preOrderImpl(subtree.right);
    }

    preOrderImpl(this.#root);

    return arr;
  }

  postOrder(): D[] {
    const arr: D[] = [];

    function postOrderImpl(subtree: BSTNode<D> | null | undefined) {
      if (!subtree) return;
      postOrderImpl(subtree.left);
      postOrderImpl(subtree.right);
      arr.push(subtree.data);
    }

    postOrderImpl(this.#root);

    return arr;
  }

  [Symbol.iterator]() {
    return this.inOrder()[Symbol.iterator]();
  }
}
