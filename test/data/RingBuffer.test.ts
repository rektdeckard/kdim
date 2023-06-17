import { describe, it, expect } from "vitest";
import { RingBuffer } from "../../src";

describe("RingBuffer", () => {
  describe("construct", () => {
    it("can be constructed with capacity", () => {
      const buff = new RingBuffer(10);
      expect(buff.capacity).toBe(10);
      expect(buff.isEmpty).toBeTruthy();
      expect(buff.dequeue()).toBeNull();
    });

    it("can be constructed with data", () => {
      const data = ["one", "two", "three", "four"];
      const buff = RingBuffer.from(data);
      expect(buff.capacity).toBe(4);
      expect(buff.data).toBe(data);
    });

    it("throws without capacity", () => {
      // @ts-expect-error
      expect(() => new RingBuffer()).toThrow();
    });

    it("throws without initial data", () => {
      // @ts-expect-error
      expect(() => RingBuffer.from()).toThrow();
    });
  });

  describe("peek", () => {
    it("can peek next", () => {
      const buff = RingBuffer.from(["age", "quod", "agis"]);
      expect(buff.peek()).toBe("age");
      expect(buff.isFull).toBeTruthy();
    });

    it("can peek nth", () => {
      const buff = RingBuffer.from(["requiescat", "en", "pace"]);
      expect(buff.peek(2)).toBe("pace");
    });
  });

  describe("enqueue/dequeue", () => {
    it("can enqueue", () => {
      const buff = new RingBuffer(4);
      buff.enqueue("hello");
      buff.enqueue("world");
      expect(buff.capacity).toBe(4);
      expect(buff.peek()).toBeTruthy();
      expect(buff.data).toStrictEqual(["hello", "world", null, null]);
    });

    it("enque overwrite", () => {
      const buff = new RingBuffer(10);
      for (let i = 0; i < 100; i++) {
        buff.enqueue(i);
      }

      expect(buff.capacity).toBe(10);
      expect(buff.peek()).toBe(90);
      expect(buff.data).toStrictEqual([90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    });

    it("can dequeue", () => {
      const data = [
        { key: "limit", value: 42 },
        { key: "transition", value: -1 },
        { key: "extent", value: Infinity },
        { key: "hold", value: 0 },
      ];
      const buff = RingBuffer.from(Array.from(data));

      expect(buff.dequeue()).toStrictEqual(data[0]);
      expect(buff.dequeue()).toStrictEqual(data[1]);
      expect(buff.dequeue()).toStrictEqual(data[2]);
      expect(buff.dequeue()).toStrictEqual(data[3]);
      expect(buff.dequeue()).toBeNull();
      expect(buff.capacity).toBe(4);
    });

    it("enqueue/dequeue stress test", () => {
      const capacity = 10_000;
      const buff = new RingBuffer<number>(capacity);
      for (let i = 0; i < buff.capacity; ++i) {
        buff.enqueue(i);
      }
      expect(buff.peek()).toBe(0);
      expect(buff.isFull).toBeTruthy();
      expect(buff.dequeue()).toBe(0);
      expect(buff.isFull).toBeFalsy();

      for (let i = 0; i < capacity / 2; ++i) {
        buff.dequeue();
      }
      expect(buff.peek()).toBe(5001);

      for (let i = 0; i < 10; ++i) {
        buff.enqueue(i + 0.5);
      }
      for (let i = 0; i < capacity / 2 - 1; ++i) {
        buff.dequeue();
      }

      const res: Array<number | null> = [];
      for (let i = 0; i < 10; ++i) {
        res.push(buff.dequeue());
      }
      expect(res).toStrictEqual([
        0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5,
      ]);
    });

    it("drain", () => {
      const data = [
        { key: "limit", value: 42 },
        { key: "transition", value: -1 },
        { key: "extent", value: Infinity },
        { key: "hold", value: 0 },
      ];
      const buff = RingBuffer.from(Array.from(data));
      expect(buff.drain()).toStrictEqual(data);

      const moreData = [
        { key: "foo", value: 21 },
        { key: "bar", value: 75 },
      ];

      buff.enqueue(moreData[0]);
      buff.enqueue(moreData[1]);
      expect(buff.drain()).toStrictEqual(moreData);

      [...data, ...moreData].forEach((el) => buff.enqueue(el));
      expect(buff.drain()).toStrictEqual([
        moreData[0],
        moreData[1],
        data[2],
        data[3],
      ]);
    });

    it("isFull", () => {
      const buff = RingBuffer.from([1, 2, 3]);
      expect(buff.isFull).toBeTruthy();
      expect(buff.capacity).toBe(3);

      buff.dequeue();
      expect(buff.isFull).toBeFalsy();
    });

    it("isEmpty", () => {
      const buff = new RingBuffer(5);
      expect(buff.isEmpty).toBeTruthy();

      buff.enqueue(1);
      expect(buff.isEmpty).toBeFalsy();
    });
  });

  describe("iterator", () => {
    it("implements iterable interface", () => {
      const buff = RingBuffer.from([1, 2, 3]);
      expect(typeof buff[Symbol.iterator]).toBe("function");
      expect(typeof buff[Symbol.iterator]().next).toBe("function");
      expect(buff[Symbol.iterator]().next().value).toBe(1);
      expect(buff[Symbol.iterator]().next().done).toBeFalsy();
      expect([...buff]).toStrictEqual([1, 2, 3]);
    });
  });
});
