import { describe, it, expect } from "vitest";
import {
  BST,
  BSTNode,
  Comparator,
  CompareFunction,
  Saturating,
} from "../../src";

function mermaid<V>(node: BSTNode<V>): string {
  let markup = `\
flowchart TD
`;

  const recurse = (node: BSTNode<V> | null | undefined) => {
    if (!node) return;

    if (node?.parent) {
      markup += `    ${node.parent.value}("${node.parent.value}") --> ${node.value}("${node.value}")\n`;
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
      const tree = new BST<string>();
      tree.insert("hello");
      tree.insert("left");
      tree.insert("right");
      tree.insert("right-right");
    });
  });

  describe("search", () => {
    const tree = new BST<string>();
    tree.insert("root");
    tree.insert("a");
    tree.insert("x");
    tree.insert("z");

    it("can find existing", () => {
      expect(tree.search("root")!.value).toBe("root");
      expect(tree.search("z")!.value).toBe("z");
    });

    it("can not find nonexisting", () => {
      expect(tree.search("n")).toBeNull();
    });
  });

  describe("has", () => {
    const tree = new BST<number>();
    tree.insert(0);
    tree.insert(5);
    tree.insert(7);
    tree.insert(10);

    it("can find existing", () => {
      expect(tree.has(0)).toBe(true);
    });

    it("can not find nonexisting", () => {
      expect(tree.has(42)).toBe(false);
    });
  });

  describe("min", () => {
    const tree = new BST<string>();
    tree.insert("a");
    tree.insert("q");
    tree.insert("s");
    tree.insert("c");
    tree.insert("r");
    tree.insert("l");
    tree.insert("b");

    it("finds the global minimum", () => {
      expect(tree.min()!.value).toBe("a");
    });

    it("finds the local minimum", () => {
      const q = tree.search("q")!;
      expect(tree.min(q)!.value).toBe("b");
    });
  });

  describe("max", () => {
    const tree = new BST<string>();
    tree.insert("a");
    tree.insert("q");
    tree.insert("s");
    tree.insert("c");
    tree.insert("r");
    tree.insert("l");
    tree.insert("b");

    it("finds the global maximum", () => {
      expect(tree.max()!.value).toBe("s");
    });

    it("finds the local maximum", () => {
      const c = tree.search("c")!;
      expect(tree.max(c)!.value).toBe("l");
    });
  });

  describe("successor", () => {
    const tree = new BST<string>();
    tree.insert("a");
    tree.insert("q");
    tree.insert("s");
    tree.insert("c");
    tree.insert("r");
    tree.insert("l");
    tree.insert("b");

    it("finds the successor", () => {
      const r = tree.search("r")!;
      expect(tree.successor(r)!.value).toBe("s");
    });

    it("does not find if no successor", () => {
      const s = tree.search("s")!;
      expect(tree.successor(s)).toBeNull();
    });
  });

  describe("predecessor", () => {
    const tree = new BST<string>();
    tree.insert("a");
    tree.insert("q");
    tree.insert("s");
    tree.insert("c");
    tree.insert("r");
    tree.insert("l");
    tree.insert("b");

    it("finds the predecessor", () => {
      const r = tree.search("r")!;
      expect(tree.predecessor(r)!.value).toBe("q");
    });

    it("does not find if no predecessor", () => {
      const a = tree.search("a")!;
      expect(tree.predecessor(a)).toBeNull();
    });
  });

  describe("delete", () => {
    it("can delete existing", () => {
      const tree = new BST<string>();
      tree.insert("root");
      tree.insert("left");
      tree.insert("right");

      expect(tree.has("root")).toBe(true);
      expect(tree.delete("right")).toBe(true);
      expect(tree.has("lol")).toBe(false);
    });

    it("does not modify when nonexisting", () => {
      const tree = new BST<string>();
      tree.insert("root");
      tree.insert("left");
      tree.insert("right");
      tree.insert("right-right");

      expect(tree.has("root")).toBe(true);
      expect(tree.has("left")).toBe(true);
      expect(tree.has("right")).toBe(true);
      expect(tree.has("right-right")).toBe(true);

      expect(tree.delete("zoom")).toBe(false);
      expect(tree.has("root")).toBe(true);
      expect(tree.has("left")).toBe(true);
      expect(tree.has("right")).toBe(true);
      expect(tree.has("right-right")).toBe(true);
    });
  });

  describe("ordering", () => {
    const tree = new BST<number>();
    tree.insert(10);
    tree.insert(5);
    tree.insert(4);
    tree.insert(8);

    it("can emit asOrdered", () => {
      expect(tree.asOrdered()).toStrictEqual([4, 5, 8, 10]);
    });

    it("can emit asPreOrdered", () => {
      expect(tree.asPreOrdered()).toStrictEqual([10, 5, 4, 8]);
    });

    it("can emit asPostOrdered", () => {
      expect(tree.asPostOrdered()).toStrictEqual([4, 8, 5, 10]);
    });

    it("is iterable", () => {
      expect([...tree]).toStrictEqual(tree.asOrdered());
    });

    describe("alternate comparators", () => {
      it("reverseLexical comparator", () => {
        const tree = new BST<string>(Comparator.reverseLexicalCompare);
        tree.insert("y");
        tree.insert("z");
        tree.insert("b");
        tree.insert("a");
        tree.insert("c");

        expect(tree.asOrdered()).toStrictEqual(["z", "y", "c", "b", "a"]);
      });

      it("numeric comparator", () => {
        const tree = new BST<Saturating>(Comparator.numericCompare);
        tree.insert(new Saturating({ max: 15 }, 5));
        tree.insert(new Saturating({ max: 15 }, 1));
        tree.insert(new Saturating({ max: 15 }, 8));
        tree.insert(new Saturating({ max: 15 }, 4));
        tree.insert(new Saturating({ max: 15 }, 11));
        tree.insert(new Saturating({ max: 15 }, 12));
        tree.insert(new Saturating({ max: 15 }, 3));

        expect(tree.asOrdered().map(Number)).toStrictEqual([
          1, 3, 4, 5, 8, 11, 12,
        ]);
      });

      it("reverseNumeric comparator", () => {
        const tree = new BST<Saturating>(Comparator.reverseNumericCompare);
        tree.insert(new Saturating({ max: 15 }, 5));
        tree.insert(new Saturating({ max: 15 }, 1));
        tree.insert(new Saturating({ max: 15 }, 8));
        tree.insert(new Saturating({ max: 15 }, 4));
        tree.insert(new Saturating({ max: 15 }, 11));
        tree.insert(new Saturating({ max: 15 }, 12));
        tree.insert(new Saturating({ max: 15 }, 3));

        expect(tree.asOrdered().map(Number)).toStrictEqual([
          12, 11, 8, 5, 4, 3, 1,
        ]);
      });

      describe("custom comparator", () => {
        type User = { id: number; name: string };

        const userA: User = { id: 59, name: "John" };
        const userB: User = { id: 23, name: "Jill" };
        const userC: User = { id: 99, name: "Hank" };
        const userD: User = { id: 10, name: "anon" };

        const compareUserHash: CompareFunction<User> = (a, b) => {
          const hashA = `${a.id.toString(16)}-${a.name}`;
          const hashB = `${b.id.toString(16)}-${b.name}`;
          return hashA === hashB ? 0 : hashA > hashB ? 1 : -1;
        };

        const tree = new BST<User>(compareUserHash);
        tree.insert(userB);
        tree.insert(userD);
        tree.insert(userC);
        tree.insert(userA);

        it("can emit asOrdered", () => {
          expect(tree.asOrdered()).toStrictEqual([userB, userA, userC, userD]);
        });

        it("can emit asPreOrdered", () => {
          expect(tree.asPreOrdered()).toStrictEqual([
            userB,
            userD,
            userC,
            userA,
          ]);
        });

        it("can emit asPostOrdered", () => {
          expect(tree.asPostOrdered()).toStrictEqual([
            userA,
            userC,
            userD,
            userB,
          ]);
        });

        it("is iterable", () => {
          expect([...tree]).toStrictEqual(tree.asOrdered());
        });
      });
    });
  });

  describe("stress test", () => {
    it("can insert many", () => {
      const size = 2 ** 14;
      const keyspace = 2 ** 16;
      const keys = new Set<number>();
      const tree = new BST<number>();

      for (let i = 0; i < size; ++i) {
        let key: number;
        do {
          key = Math.floor(Math.random() * keyspace);
        } while (keys.has(key));
        keys.add(key);
        tree.insert(i);
      }

      expect(tree.asOrdered().length).toEqual(size);
    });
  });
});
