import { objectHash } from "../math/hash";

type HashFunction<T> = (data: T) => Promise<string> | string;

const DEFAULT_HASH_FUNCTIONS = [
  <T>(data: T) => objectHash(data, { algorithm: "SHA-1" }),
  <T>(data: T) => objectHash(data, { algorithm: "SHA-256" }),
  <T>(data: T) => objectHash(data, { algorithm: "SHA-384" }),
  <T>(data: T) => objectHash(data, { algorithm: "SHA-512" }),
];

export type BloomFilterOptions<T> = {
  size?: number;
  hashFunctions?: Array<HashFunction<T>>;
};

export class BloomFilter<T = any> {
  #size: number;
  #bitField: Array<boolean>;
  #hashFunctions: Array<HashFunction<T>>;

  constructor({
    size = 1_000_000,
    hashFunctions = DEFAULT_HASH_FUNCTIONS,
  }: BloomFilterOptions<T> = {}) {
    this.#size = size;
    this.#bitField = new Array(size);
    this.#hashFunctions = hashFunctions;
  }

  async #hash(element: T): Promise<Array<string>> {
    return Promise.all(this.#hashFunctions.map((fn) => fn(element)));
  }

  async add(element: T) {
    const hashes = await this.#hash(element);
    for (const hash of hashes) {
      const idx = parseInt(hash, 16) % this.#size;
      this.#bitField[idx] = true;
    }
  }

  async test(element: T) {
    const hashes = await this.#hash(element);
    for (const hash of hashes) {
      const idx = parseInt(hash, 16) % this.#size;
      if (this.#bitField[idx]) {
        return true;
      }
    }

    return false;
  }
}
