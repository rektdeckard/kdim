import { describe, it, expect } from "vitest";
import { BST } from "../../src";

describe("BST", () => {
  describe("construct", () => {
    it("can be constructed without dataset", () => {
      const tree = new BST();
      expect(tree).toBeTruthy();
    });
  });

  describe("insert", () => {
    it("can insert", () => {
      const tree = new BST<number, string>();
      tree.insert(0, "hello");
      tree.insert(5, "left");
      tree.insert(7, "right");
      tree.insert(10, "right-right");
    });
  });

  describe("search", () => {
    it("can search", () => {
      const tree = new BST<number, string>();
      tree.insert(0, "root");
      tree.insert(5, "left");
      tree.insert(7, "right");
      tree.insert(10, "right-right");

      expect(tree.search(0)!.value).toBe("root");
      expect(tree.search(10)!.value).toBe("right-right");
      expect(tree.search(42)).toBeNull();
    });
  });

  describe("delete", () => {
    it("can delete", () => {
      const tree = new BST<number, string>();
      tree.insert(0, "root");
      tree.insert(5, "left");
      tree.insert(7, "right");
      tree.delete(5);
    });
  });

  describe("ordering", () => {
    const tree = new BST<number, string>();
    tree.insert(10, "ten");
    tree.insert(5, "five");
    tree.insert(4, "four");
    tree.insert(8, "eight");

    it("can sort inOrder", () => {
      expect(tree.inOrder()).toStrictEqual([
        [4, "four"],
        [5, "five"],
        [8, "eight"],
        [10, "ten"],
      ]);
    });

    it("can sort preOrder", () => {
      expect(tree.preOrder()).toStrictEqual([
        [10, "ten"],
        [5, "five"],
        [4, "four"],
        [8, "eight"],
      ]);
    });

    it("can sort postOrder", () => {
      expect(tree.postOrder()).toStrictEqual([
        [4, "four"],
        [8, "eight"],
        [5, "five"],
        [10, "ten"],
      ]);
    });

    it("is iterable", () => {
      expect([...tree]).toStrictEqual(tree.inOrder());
    });
  });

  describe("stress test", () => {
    it("can insert many", () => {
      const size = 2 ** 14;
      const keyspace = 2 ** 16;
      const keys = new Set<number>();
      const tree = new BST<number, number>();

      for (let i = 0; i < size; ++i) {
        let key: number;
        do {
          key = Math.floor(Math.random() * keyspace);
        } while (keys.has(key));
        keys.add(key);
        tree.insert(key, i);
      }

      expect(tree.inOrder().length).toEqual(size);
    });
  });
});
