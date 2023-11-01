# Fourier

Perform Fourier analysis on discrete numeric data.

<details>
<summary>Class Signature</summary>
<p>

```ts
class Fourier {
  static dft(input: (Number | Complex)[]): Complex[];
}
```

  </p>
</details>

```ts
import { Fourier } from "kdim";

const samples = [1, 1, 0, 0];
const d = Fourier.dft(sample);
// [
//   Complex { real: 2, imaginary: 0 },
//   Complex { real: 1, imaginary: -1 },
//   Complex { real: 0, imaginary: 0 },
//   Complex { real: 1, imaginary: 1 },
// ]
```
