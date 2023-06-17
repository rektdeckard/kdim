import { describe, it, expect } from "vitest";
import { KDTree } from "../../src";

function generateField(count, dimensions, range = [0, 1]) {
  const [min, max] = range;
  let points: number[][] = [];

  for (let i = 0; i < count; ++i) {
    let point: number[] = [];
    for (let j = 0; j < dimensions; ++j) {
      point.push(Math.random() * (max - min) + min);
    }
    points.push(point);
  }

  return points;
}

function linearSearch(data, point) {
  let distance = Infinity;
  let nearest;

  data.forEach((test) => {
    const dsq = test.reduce((sum, curr, i) => {
      return sum + (curr - point[i]) ** 2;
    }, 0);

    if (dsq < distance) {
      distance = dsq;
      nearest = test;
    }
  });

  return { point: nearest, distance: Math.sqrt(distance) };
}

describe("KDTree", () => {
  describe("construct", () => {
    it("can be constructed without dataset", () => {
      const tree = new KDTree();
      expect(tree.dimensions).toBe(0);
      expect(tree.tree).toBeNull();
    });

    it("can be constructed from simple 2d dataset", () => {
      const data = [
        [0, 7],
        [1, 1],
        [6, 9],
        [8, 40],
        [31, 9],
      ];

      const tree = new KDTree(data);
      expect(tree.dimensions).toBe(2);
      expect(tree.tree?.point[0]).toBe(6);
      expect(tree.tree?.point[1]).toBe(9);
    });

    it("can be constructed from huge 2d datasets", () => {
      let data = generateField(1000, 2);
      const tree = new KDTree(data);
      expect(tree.dimensions).toBe(2);
      expect(tree.tree?.point).not.toBeNull();
    });

    it("can be constructed from higher-dimensional dataset", () => {
      const data = [
        [0.00023, 0.19, 4.235, 4.63],
        [31, 9.54324, 1.4634, -0.43],
        [24.5, 0.61, 33.984, 420.69],
      ];
      const tree = new KDTree(data);
      expect(tree.dimensions).toBe(4);
      expect(tree.tree?.point).not.toBeNull();
    });

    it("can be constructed from huge higher-dimensional dataset", () => {
      const data = generateField(10000, 10, [0, 1]);
      const tree = new KDTree(data);
      expect(tree.dimensions).toBe(10);
      expect(tree.tree?.point).not.toBeNull();
    });

    // TODO: figure out how to type `Vec` to support this
    it.skip("can be constructed from typed arrays", () => {
      const data = [
        new Int8Array(4).fill(1),
        new Int8Array(4).fill(2),
        new Int8Array(4).fill(3),
        new Int8Array(4).fill(4),
        new Int8Array(4).fill(5),
      ];

      // @ts-ignore
      const tree = new KDTree(data, { clone: false });
      // @ts-ignore
      const r1 = tree.nearestNeighbor(new Int8Array([2, 2, 3, 2]));
      const r2 = tree.nearestNeighbor([2, 2, 3, 2]);

      expect(Array.from(r1.point!)).toStrictEqual([2, 2, 2, 2]);
      expect(r1.distance).toBe(1);
      expect(r1.point).toStrictEqual(data[1]);
      expect(r1).toStrictEqual(r2);
    });

    describe("options", () => {
      it("defaults to clone", () => {
        const data = [
          [1, 2, 3],
          [2, 4, 7],
          [5, 9, 1],
        ];

        const tree = new KDTree(data);
        delete data[0];
        expect(tree.tree?.left?.point).toStrictEqual([1, 2, 3]);
        expect(data[0]).toBeFalsy();
      });

      it("respects noclone", () => {
        const data = [
          [1, 2, 3],
          [2, 4, 7],
          [5, 9, 1],
        ];

        const tree = new KDTree(data, { clone: false });
        expect(tree.remove([1, 2, 3])).toStrictEqual([1, 2, 3]);
        expect(data[0]).not.toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe("insert", () => {
    it("can insert to empty tree", () => {
      const tree = new KDTree();
      tree.insert([1, 2, 3, 4, 5, 6, 7]);
      expect(tree.dimensions).toBe(7);
    });

    it("can insert into a populated tree", () => {
      const tree = new KDTree(generateField(10, 3, [0, 500]));
      tree.insert([69, 420, 311]);
      expect(tree.has([69, 420, 311])).toBeTruthy();
    });

    it("can insert into a huge populated tree", () => {
      const tree = new KDTree(generateField(10000, 5));
      tree.insert([0.01, 0.05, 0.2, 0.33, 0.69]);
      expect(tree.has([0.01, 0.05, 0.2, 0.33, 0.69])).toBeTruthy();
    });

    it("throws when inserting incorrect sized point", () => {
      const tree = new KDTree([
        [3, 3, 3],
        [3, 3, 3],
        [3, 3, 3],
      ]);

      expect(() => tree.insert([4, 4, 4, 4])).toThrow();
    });
  });

  describe("remove", () => {
    it("can remove an element by reference", () => {
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);
      const removed = tree.remove(data[1]);
      expect(removed).toBe(data[1]);
    });

    it("can remove an element by values", () => {
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);
      const removed = tree.remove([6, 9, 420]);
      expect(removed).toBe(data[2]);
    });
  });

  describe("has", () => {
    it("can find an element by reference", () => {
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);
      expect(tree.has([1, 1, 0])).toBeTruthy();
      expect(tree.has([9, 9, 9])).toBeFalsy();
    });

    it("can find an element by values", () => {
      const notData = [[9, 9, 9]];
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);
      expect(tree.has(data[3])).toBeTruthy();
      expect(tree.has(notData[0])).toBeFalsy();
    });
  });

  describe("nearestNeighbor", () => {
    it("can find nearest neighbor in a simple 2d tree", () => {
      const data = [
        [0, 7],
        [1, 1],
        [6, 9],
        [8, 40],
        [31, 9],
      ];

      const tree = new KDTree(data);
      const { point, distance } = tree.nearestNeighbor([8, 39]);
      expect(point).toStrictEqual([8, 40]);
      expect(distance).toBe(1);
    });

    it("can find nearest neighbor in a higher-dimensional tree", () => {
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);
      const { point, distance } = tree.nearestNeighbor([32, 9, 33]);
      expect(point).toStrictEqual([31, 9, 33]);
      expect(distance).toBe(1);
    });

    it("can find nearest neighbor in a huge 2d tree", () => {
      const target1 = [69, 420];
      const target2 = [1, 1];
      const target3 = [9000, 9000];

      const data = generateField(100000, 2, [-1000, 1000]);
      const tree = new KDTree(data);

      const result1 = tree.nearestNeighbor(target1);
      expect(result1).toStrictEqual(linearSearch(data, target1));

      const result2 = tree.nearestNeighbor(target2);
      expect(result2).toStrictEqual(linearSearch(data, target2));

      const result3 = tree.nearestNeighbor(target3);
      expect(result3).toStrictEqual(linearSearch(data, target3));
    });

    it("can find nearest neighbor in a huge higher-dimensional tree", () => {
      const target1 = [69, 420, 1, 1, 1];
      const target2 = [1, 1, 0, 10, 50];
      const target3 = [9000, 9000, 9000, 9000, 9000];

      const data = generateField(100000, 5, [-1000, 1000]);
      const tree = new KDTree(data);

      const result1 = tree.nearestNeighbor(target1);
      expect(result1).toStrictEqual(linearSearch(data, target1));

      const result2 = tree.nearestNeighbor(target2);
      expect(result2).toStrictEqual(linearSearch(data, target2));

      const result3 = tree.nearestNeighbor(target3);
      expect(result3).toStrictEqual(linearSearch(data, target3));
    });

    it("returns expected result with empty tree", () => {
      const target = [1, 1];

      const tree = new KDTree([]);
      expect(tree.nearestNeighbor(target)).toStrictEqual({
        point: null,
        distance: Infinity,
      });
    });
  });

  describe("iterator", () => {
    it("implements iterable interface", () => {
      const data = [
        [0, 7, 15],
        [1, 1, 0],
        [6, 9, 420],
        [8, 40, -12],
        [31, 9, 33],
      ];

      const tree = new KDTree(data);

      expect(typeof tree[Symbol.iterator]).toBe("function");
      expect(typeof tree[Symbol.iterator]().next).toBe("function");
      expect(tree[Symbol.iterator]().next().value).toStrictEqual(data[0]);
      expect(tree[Symbol.iterator]().next().done).toBeFalsy();
      expect([...tree]).toStrictEqual([...data]);
    });
  });
});

describe("instruments", () => {
  describe("generateField", () => {
    it("generates expected 2d fields", () => {
      const size = 100;
      const dimensions = 2;
      const field = generateField(size, dimensions);

      expect(field.length).toBe(100);
      expect(
        field.every((point) =>
          point.every((coordinate) => coordinate >= 0 && coordinate <= 1)
        )
      ).toBe(true);
    });

    it("generates expected higher-dimensional fields", () => {
      const size = 20;
      const dimensions = 20;
      const min = -50;
      const max = 50;
      const field = generateField(size, dimensions, [min, max]);

      expect(field.length).toBe(size);
      expect(
        field.every((point) =>
          point.every((coordinate) => coordinate >= min && coordinate <= max)
        )
      ).toBe(true);
    });
  });

  describe("linearSearch", () => {
    it("can perform linear search on simple 2d dataset", () => {
      const field = [
        [0, 7],
        [1, 1],
        [6, 9],
        [8, 40],
        [31, 9],
      ];

      const { point, distance } = linearSearch(field, [8, 45]);
      expect(point).toStrictEqual([8, 40]);
      expect(distance).toBe(5);
    });

    it("can perform linear search on higher-dimensional dataset", () => {
      const needle = [-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4];
      const field = [...generateField(24, 9), needle, ...generateField(75, 9)];

      expect(field.length).toBe(100);

      const tree = new KDTree(field);
      const result = tree.nearestNeighbor(needle);
      expect(result.point).toStrictEqual(needle);
      expect(result.distance).toBe(0);
    });
  });
});
