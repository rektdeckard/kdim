# Constants

Exported numeric constants for various integer sizes:

```ts
const U8_MAX = (1 << 8) - 1;
const U16_MAX = (1 << 16) - 1;
const U32_MAX = -1 >>> 0;
const I8_MAX = (1 << 7) - 1;
const I8_MIN = -I8_MAX - 1;
const I16_MAX = (1 << 15) - 1;
const I16_MIN = -I16_MAX - 1;
const I32_MAX = (U32_MAX + 1) / 2 - 1;
const I32_MIN = -I32_MAX - 1;
```
