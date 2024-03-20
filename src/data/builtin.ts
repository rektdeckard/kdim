export class ArrayTools {
  constructor(..._: never) {
    throw new Error(
      "ArrayTools contains static methods only and is not meant to be constructed"
    );
  }

  static zip<A, B>(a: A[], b: B[]): [A, B][] {
    if (a.length !== b.length) throw new Error("Unequal array lengths");
    return a.map((ai, i) => [ai, b[i]]);
  }

  static unzip<A, B>(tuples: [A, B][]): [A[], B[]] {
    return tuples.reduce<[A[], B[]]>(
      (ab, [a, b]) => {
        ab[0].push(a);
        ab[1].push(b);
        return ab;
      },
      [[], []]
    );
  }

  static zip3<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][] {
    if (a.length !== b.length || a.length !== c.length)
      throw new Error("Unequal array lengths");
    return a.map((ai, i) => [ai, b[i], c[i]]);
  }

  static unzip3<A, B, C>(tuples: [A, B, C][]): [A[], B[], C[]] {
    return tuples.reduce<[A[], B[], C[]]>(
      (abc, [a, b, c]) => {
        abc[0].push(a);
        abc[1].push(b);
        abc[2].push(c);
        return abc;
      },
      [[], [], []]
    );
  }
}
