import { objectHash } from "../math/hash";

type HashFunction<T> = (data: T) => Promise<string> | string;

export type BloomFilterOptions<T> = {
  size?: number;
  hashFunctions?: Array<HashFunction<T>>;
};

export class BloomFilter<T = any> {
  private _size: number;
  private _bitField: Array<boolean>;
  private _hashFunctions: Array<HashFunction<T>>;

  static DEFAULT_HASH_FUNCTIONS = [
    <T>(data: T) => objectHash(data, { algorithm: "SHA-1" }),
    <T>(data: T) => objectHash(data, { algorithm: "SHA-256" }),
    <T>(data: T) => objectHash(data, { algorithm: "SHA-384" }),
    <T>(data: T) => objectHash(data, { algorithm: "SHA-512" }),
  ];

  constructor({
    size = 16 ** 5,
    hashFunctions = BloomFilter.DEFAULT_HASH_FUNCTIONS,
  }: BloomFilterOptions<T> = {}) {
    this._size = size;
    this._bitField = new Array(size);
    this._hashFunctions = hashFunctions;
  }

  private async _hash(element: T): Promise<Array<string>> {
    return Promise.all(this._hashFunctions.map((fn) => fn(element)));
  }

  async add(element: T) {
    const hashes = await this._hash(element);
    for (const hash of hashes) {
      const idx = parseInt(hash.substring(0, 8), 16) % this._size;
      this._bitField[idx] = true;
    }
  }

  async test(element: T) {
    const hashes = await this._hash(element);
    for (const hash of hashes) {
      const idx = parseInt(hash.substring(0, 8), 16) % this._size;
      if (this._bitField[idx]) {
        return true;
      }
    }

    return false;
  }
}
