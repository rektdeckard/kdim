import { Complex } from "./complex";

export class Fourier {
  constructor(..._: never) {
    throw new Error(
      "Fourier contains static methods only and is not meant to be constructed"
    );
  }

  static dft(input: (Number | Complex)[]): Complex[] {
    const s = input.map(Complex.from);
    const n = s.length;
    const out = new Array<Complex>(n);

    for (let k = 0; k < n; k++) {
      let sum = Complex.from(0);

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * t * k) / n;
        sum = sum.add(
          new Complex(
            s[t].real * Math.cos(angle) + s[t].imaginary * Math.sin(angle),
            -s[t].real * Math.sin(angle) + s[t].imaginary * Math.cos(angle)
          )
        );
      }

      out[k] = sum;
    }

    return out;
  }

  // static dtft(input: (Number | Complex)[]): Complex[] {}
  // static idft(input: (Number | Complex)[]): Complex[] {}
}
