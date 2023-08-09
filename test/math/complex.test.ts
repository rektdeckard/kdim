import { describe, it, expect } from "vitest";
import { ComplexNumber, Saturating } from "../../src";

describe("ComplexNumber", () => {
  describe("new ComplexNumber()", () => {
    it("can be constructed with only a real component", () => {
      const n = new ComplexNumber(0);
      expect(+n).toBe(0);
      expect(n.toString()).toBe("0");
    });

    it("can be constructed with a real and imaginary component", () => {
      const n = new ComplexNumber(3, 1);
      expect(+n).toBe(3);
      expect(n.real).toBe(3);
      expect(n.imaginary).toBe(1);
    });
  });

  describe("toString", () => {
    it("renders signs when appropriate", () => {
      const a = new ComplexNumber(2, -5);
      expect(a.toString()).toBe("2-5i");

      const b = new ComplexNumber(-2, 5);
      expect(b.toString()).toBe("-2+5i");

      const c = new ComplexNumber(2, 5);
      expect(c.toString()).toBe("2+5i");
    });

    it("excludes zero real part", () => {
      const a = new ComplexNumber(0, 7);
      expect(a.toString()).toBe("7i");
    });

    it("excludes zero imaginary part", () => {
      const a = new ComplexNumber(5);
      expect(a.toString()).toBe("5");
    });
  });

  describe("add", () => {
    it("can add two complex numbers", () => {
      const a = new ComplexNumber(3, -5);
      const b = new ComplexNumber(2, 3);
      const sum = a.add(b);

      expect(sum.real).toBe(5);
      expect(sum.imaginary).toBe(-2);
    });

    it("can add a complex number and a primitive", () => {
      const a = new ComplexNumber(3, -5);
      const sumA = a.add(10);
      expect(sumA.real).toBe(13);
      expect(sumA.imaginary).toBe(-5);
    });

    it("can add a complex number and a Number object", () => {
      const a = new ComplexNumber(3, -5);

      const sumB = a.add(new Number(10));
      expect(sumB.real).toBe(13);
      expect(sumB.imaginary).toBe(-5);

      const sumC = a.add(new Saturating({ max: 20 }, 10));
      expect(sumC.real).toBe(13);
      expect(sumC.imaginary).toBe(-5);
    });
  });

  describe("sub", () => {
    it("can sub two complex numbers", () => {
      const a = new ComplexNumber(3, -5);
      const b = new ComplexNumber(2, 3);
      const diff = a.sub(b);

      expect(diff.real).toBe(1);
      expect(diff.imaginary).toBe(-8);
    });

    it("can sub a complex number and a primitive", () => {
      const a = new ComplexNumber(3, -5);
      const diffA = a.sub(10);
      expect(diffA.real).toBe(-7);
      expect(diffA.imaginary).toBe(-5);
    });

    it("can sub a complex number and a Number object", () => {
      const a = new ComplexNumber(3, -5);

      const diffB = a.sub(new Number(10));
      expect(diffB.real).toBe(-7);
      expect(diffB.imaginary).toBe(-5);

      const diffC = a.sub(new Saturating({ max: 20 }, 10));
      expect(diffC.real).toBe(-7);
      expect(diffC.imaginary).toBe(-5);
    });
  });

  describe("mul", () => {
    it("can multiply two complex numbers", () => {
      const a = new ComplexNumber(3, 2);
      const b = new ComplexNumber(1, 7);
      const prod = a.mul(b);
      expect(prod.real).toBe(-11);
      expect(prod.imaginary).toBe(23);
    });

    it("can multiply a complex number and a primitive", () => {
      const a = new ComplexNumber(3, 2);
      const prod = a.mul(7);
      expect(prod.real).toBe(21);
      expect(prod.imaginary).toBe(14);
    });

    it("can multiply a complex number and a Number object", () => {
      const a = new ComplexNumber(3, 2);
      const prod = a.mul(new Number(7));
      expect(prod.real).toBe(21);
      expect(prod.imaginary).toBe(14);
    });
  });

  describe("div", () => {
    it("can divide two complex numbers", () => {
      const a = new ComplexNumber(20, -4);
      const b = new ComplexNumber(3, 2);
      const quo = a.div(b);
      expect(quo.real).toBe(4);
      expect(quo.imaginary).toBe(-4);
    });

    it("can divide a complex number and a primitive", () => {
      const a = new ComplexNumber(2, 3);
      const quo = a.div(4);
      expect(quo.real).toBe(0.5);
      expect(quo.imaginary).toBe(0.75);
    });

    it("can divide a complex number and a Number object", () => {
      const a = new ComplexNumber(2, 3);
      const quo = a.div(new Number(4));
      expect(quo.real).toBe(0.5);
      expect(quo.imaginary).toBe(0.75);
    });
  });

  describe("pow", () => {
    it("can be raised to a primitive power", () => {
      const a = new ComplexNumber(4, 7);
      const p1 = a.pow(3);
      const p2 = a.mul(a).mul(a);
      expect(p1.real).toBe(p2.real);
      expect(p1.imaginary).toBe(p2.imaginary);
    });
  });

  describe("eq", () => {
    it("considers complex numbers with identical real and imaginary parts equal", () => {
      const a = new ComplexNumber(369, 50);
      const b = new ComplexNumber(369, 50);
      expect(a.eq(b)).toBe(true);
    });

    it("considers complex number with no imaginary part to equal primitive real part", () => {
      const a = new ComplexNumber(369, 0);
      expect(a.eq(369)).toBe(true);
    });
  });
});
