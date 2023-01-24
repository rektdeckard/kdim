import { Vec } from "../types";

class Node<T> {
  parent: Node<T> | null;
  point: T;
  left: Node<T> | null;
  right: Node<T> | null;

  constructor(point: T) {
    this.point = point;
    this.parent = null;
    this.left = null;
    this.right = null;
  }
}

type KDTreeOptions = {
  clone?: boolean;
};

export class KDTree<K extends number> implements Iterable<Vec<K>> {
  readonly #data: Vec<K>[];
  #dimensions: number;
  #tree: Node<Vec<K>> | null;

  constructor(data?: Vec<K>[], options: KDTreeOptions = { clone: true }) {
    this.#data = !data ? [] : options?.clone ? [...data] : data;
    this.#dimensions = data?.[0]?.length ?? 0;
    this.#tree = this.#partition(this.#data, 0, null);
  }

  get dimensions() {
    return this.#dimensions;
  }

  get tree() {
    return this.#tree;
  }

  #median(list: Vec<K>[]): [Vec<K>, number] {
    const center = Math.floor(list.length / 2);
    return [list[center], center];
  }

  #partition(
    list: Vec<K>[],
    dimension: number,
    parent: Node<Vec<K>> | null
  ): Node<Vec<K>> | null {
    if (list.length === 0) return null;

    list.sort((a, b) => a[dimension] - b[dimension]);
    const [point, index] = this.#median(list);
    const nextDimension = (dimension + 1) % this.#dimensions;

    const node = new Node<Vec<K>>(point);
    node.parent = parent;
    node.left = this.#partition(list.slice(0, index), nextDimension, node);
    node.right = this.#partition(list.slice(index + 1), nextDimension, node);

    return node;
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }

  insert(point: Vec<K>) {
    if (!this.#data.length) {
      this.#dimensions = point.length;
    } else if (this.#dimensions !== point.length) {
      throw new TypeError(
        `Point [${point}] has ${point.length} dimensions, but should have ${
          this.#dimensions
        }`
      );
    }

    this.#data.push(point);
    this.#tree = this.#partition(this.#data, 0, null);
  }

  remove(point: Vec<K>): Vec<K> | null | void {
    if (!this.#data.length) return;
    if (point.length !== this.#dimensions) return;

    const result = this.nearestNeighbor(point);
    if (result.distance === 0) {
      const i = this.#data.findIndex((p) => p === result.point);
      this.#data.splice(i, 1);
      this.#tree = this.#partition(this.#data, 0, null);
      return result.point;
    }
  }

  has(point: Vec<K>): boolean {
    if (point.length !== this.#dimensions) return false;
    return this.nearestNeighbor(point).distance === 0;
  }

  nearestNeighbor(point: Vec<K>): {
    point: Vec<K> | null;
    distance: number;
  } {
    function sqdist(a: Vec<K>, b: Vec<K> | null | undefined): number {
      if (!b) return Infinity;

      return a.reduce((sum, curr, i) => {
        return sum + (curr - b[i]) ** 2;
      }, 0);
    }

    function closest(a: Node<Vec<K>> | null, b: Node<Vec<K>> | null) {
      if (!a) return b;
      if (!b) return a;
      if (sqdist(point, a.point) <= sqdist(point, b.point)) {
        return a;
      }

      return b;
    }

    const nearestNeighborImpl = (
      node: Node<Vec<K>> | null,
      depth: number
    ): Node<Vec<K>> | null => {
      if (!node) return null;

      let nextBranch;
      let otherBranch;
      if (
        point[depth % this.#dimensions] <= node.point[depth % this.dimensions]
      ) {
        nextBranch = node.left;
        otherBranch = node.right;
      } else {
        nextBranch = node.right;
        otherBranch = node.left;
      }

      let temp = nearestNeighborImpl(nextBranch, depth + 1);
      let best = closest(temp, node);

      const dsq = sqdist(point, best?.point);
      const dd =
        point[depth % this.#dimensions] - node.point[depth % this.#dimensions];

      if (dsq >= dd ** 2) {
        temp = nearestNeighborImpl(otherBranch, depth + 1);
        best = closest(temp, best);
      }

      return best;
    };

    const nearest = nearestNeighborImpl(this.#tree, 0);

    return {
      point: nearest?.point ?? null,
      distance: Math.sqrt(sqdist(point, nearest?.point)),
    };
  }
}
