import { describe, it, expect } from "vitest";
import { inspect } from "util";
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

      expect(tree.search(0)).toBe("root");
      expect(tree.search(10)).toBe("right-right");
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
      expect(tree.inOrder()).toStrictEqual(["four", "five", "eight", "ten"]);
    });

    it("can sort preOrder", () => {
      expect(tree.preOrder()).toStrictEqual(["ten", "five", "four", "eight"]);
    });

    it("can sort postOrder", () => {
      expect(tree.postOrder()).toStrictEqual(["four", "eight", "five", "ten"]);
    });

    it("is iterable", () => {
      expect([...tree]).toStrictEqual(tree.inOrder());
    });
  });
});
