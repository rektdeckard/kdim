import { describe, it, expect } from "vitest";
import { BST, BSTNode, NodeKey } from "../../src";

function mermaid<K extends NodeKey, V>(node: BSTNode<K, V>): string {
  let markup = `\
flowchart TD
`;

  const recurse = (node: BSTNode<K, V> | null | undefined) => {
    if (!node) return;

    if (node?.parent) {
      markup += `    ${node.parent.key}("${node.parent.key}(${node.parent.value})") --> ${node.key}("${node.key}(${node.value})")\n`;
    }
    recurse(node?.left);
    recurse(node?.right);
  };

  recurse(node);
  return markup;
}

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
    const tree = new BST<number, string>();
    tree.insert(0, "root");
    tree.insert(5, "left");
    tree.insert(7, "right");
    tree.insert(10, "right-right");

    it("can find existing", () => {
      expect(tree.search(0)!.value).toBe("root");
      expect(tree.search(10)!.value).toBe("right-right");
    });

    it("can not find nonexisting", () => {
      expect(tree.search(42)).toBeNull();
    });
  });

  describe("has", () => {
    const tree = new BST<number, string>();
    tree.insert(0, "root");
    tree.insert(5, "left");
    tree.insert(7, "right");
    tree.insert(10, "right-right");

    it("can find existing", () => {
      expect(tree.has(0)).toBe(true);
    });

    it("can not find nonexisting", () => {
      expect(tree.has(42)).toBe(false);
    });
  });

  describe("min", () => {
    const tree = new BST<string, number>();
    tree.insert("a", 12);
    tree.insert("q", 43);
    tree.insert("s", 90);
    tree.insert("c", 17);
    tree.insert("r", 44);
    tree.insert("l", 9);
    tree.insert("b", 99);

    it("finds the global minimum", () => {
      expect(tree.min()!.key).toBe("a");
    });

    it("finds the local minimum", () => {
      const q = tree.search("q")!;
      expect(tree.min(q)!.key).toBe("b");
    });
  });

  describe("max", () => {
    const tree = new BST<string, number>();
    tree.insert("a", 12);
    tree.insert("q", 43);
    tree.insert("s", 90);
    tree.insert("c", 17);
    tree.insert("r", 44);
    tree.insert("l", 9);
    tree.insert("b", 99);

    it("finds the global maximum", () => {
      expect(tree.max()!.key).toBe("s");
    });

    it("finds the local maximum", () => {
      const c = tree.search("c")!;
      expect(tree.max(c)!.key).toBe("l");
    });
  });

  describe("successor", () => {
    const tree = new BST<string, number>();
    tree.insert("a", 12);
    tree.insert("q", 43);
    tree.insert("s", 90);
    tree.insert("c", 17);
    tree.insert("r", 44);
    tree.insert("l", 9);
    tree.insert("b", 99);

    it("finds the successor", () => {
      const r = tree.search("r")!;
      expect(tree.successor(r)!.key).toBe("s");
    });

    it("does not find if no successor", () => {
      const s = tree.search("s")!;
      expect(tree.successor(s)).toBeNull();
    });
  });

  describe("predecessor", () => {
    const tree = new BST<string, number>();
    tree.insert("a", 12);
    tree.insert("q", 43);
    tree.insert("s", 90);
    tree.insert("c", 17);
    tree.insert("r", 44);
    tree.insert("l", 9);
    tree.insert("b", 99);

    it("finds the predecessor", () => {
      const r = tree.search("r")!;
      expect(tree.predecessor(r)!.key).toBe("q");
    });

    it("does not find if no predecessor", () => {
      const a = tree.search("a")!;
      expect(tree.predecessor(a)).toBeNull();
    });
  });

  describe("delete", () => {
    it("can delete existing", () => {
      const tree = new BST<number, string>();
      tree.insert(0, "root");
      tree.insert(5, "left");
      tree.insert(7, "right");

      expect(tree.has(5)).toBe(true);
      expect(tree.delete(5)).toBe(true);
      expect(tree.has(5)).toBe(false);
    });

    it("does not modify when nonexisting", () => {
      const tree = new BST<number, string>();
      tree.insert(0, "root");
      tree.insert(5, "left");
      tree.insert(7, "right");
      tree.insert(10, "right-right");

      expect(tree.has(0)).toBe(true);
      expect(tree.has(7)).toBe(true);
      expect(tree.has(7)).toBe(true);
      expect(tree.has(10)).toBe(true);

      expect(tree.delete(42)).toBe(false);
      expect(tree.has(0)).toBe(true);
      expect(tree.has(7)).toBe(true);
      expect(tree.has(7)).toBe(true);
      expect(tree.has(10)).toBe(true);
    });
  });

  describe("ordering", () => {
    const tree = new BST<number, string>();
    tree.insert(10, "ten");
    tree.insert(5, "five");
    tree.insert(4, "four");
    tree.insert(8, "eight");

    it("can emit asOrdered", () => {
      expect(tree.asOrdered()).toStrictEqual([
        [4, "four"],
        [5, "five"],
        [8, "eight"],
        [10, "ten"],
      ]);
    });

    it("can emit asPreOrdered", () => {
      expect(tree.asPreOrdered()).toStrictEqual([
        [10, "ten"],
        [5, "five"],
        [4, "four"],
        [8, "eight"],
      ]);
    });

    it("can emit asPostOrdered", () => {
      expect(tree.asPostOrdered()).toStrictEqual([
        [4, "four"],
        [8, "eight"],
        [5, "five"],
        [10, "ten"],
      ]);
    });

    it("is iterable", () => {
      expect([...tree]).toStrictEqual(tree.asOrdered());
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

      expect(tree.asOrdered().length).toEqual(size);
    });
  });
});
