/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 object-hash contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type ObjectHashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export type ObjectHashOptions = {
  algorithm?: ObjectHashAlgorithm;
};

const DEFAULT_OPTIONS: ObjectHashOptions = {
  algorithm: "SHA-1",
};

const LEGAL_ALGORITHMS = new Set(["SHA-1", "SHA-256", "SHA-384", "SHA-512"]);

export async function objectHash<T>(
  obj: T,
  options: ObjectHashOptions = {}
): Promise<string> {
  if (typeof obj === "undefined" || obj === null) {
    throw new Error("Object argument required");
  }

  const { algorithm } = { ...DEFAULT_OPTIONS, ...options };

  if (!LEGAL_ALGORITHMS.has(algorithm!.toUpperCase())) {
    throw new Error(`Invalid algorithm ${algorithm}`);
  }

  const stream = new PassThrough();
  const hasher = typeHasher({}, stream);
  hasher.dispatch(obj);

  if (typeof window === "undefined") {
    return Array.from(
      new Uint8Array(
        await require("crypto").webcrypto.subtle.digest(
          algorithm,
          new TextEncoder().encode(stream.read())
        )
      )
    )
      .map((n) => n.toString(16))
      .join("");
  } else {
    return Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-1",
          new TextEncoder().encode(stream.read())
        )
      )
    )
      .map((n) => n.toString(16))
      .join("");
  }
}

export function typeHasher(
  options: any = {},
  stream: any,
  context: Array<any> = []
) {
  type Type =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
    | "null";

  type PropertyHasher = `_${Type}`;

  const write = (str: string) => {
    if (stream.update) {
      return stream.update(str, "utf8");
    } else {
      return stream.write(str, "utf8");
    }
  };

  return {
    dispatch: function (value: any): string {
      const type: Type = value === null ? "null" : typeof value;
      // console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);
      // @ts-ignore
      return this[("_" + type) as PropertyHasher](value);
    },
    _object: function (object: Record<any, any>) {
      const pattern = /\[object (.*)\]/i;
      const objString = Object.prototype.toString.call(object);
      const test = pattern.exec(objString);

      const objType = (
        !test ? "unknown:[" + objString + "]" : test![1]
      ).toLowerCase(); // take only the class name

      let objectNumber: number | null = null;

      if ((objectNumber = context.indexOf(object)) >= 0) {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      } else {
        context.push(object);
      }

      //   if (
      //     typeof Buffer !== "undefined" &&
      //     Buffer.isBuffer &&
      //     Buffer.isBuffer(object)
      //   ) {
      //     write("buffer:");
      //     return write(object);
      //   }

      if (
        objType !== "object" &&
        objType !== "function" &&
        objType !== "asyncfunction"
      ) {
        if (this[("_" + objType) as PropertyHasher]) {
          // @ts-ignore
          this[("_" + objType) as PropertyHasher](object);
        } else {
          throw new Error('Unknown object type "' + objType + '"');
        }
      } else {
        var keys = Object.keys(object);
        keys = keys.sort();
        // Make sure to incorporate special properties, so
        // Types with different prototypes will produce
        // a different hash and objects derived from
        // different functions (`new Foo`, `new Bar`) will
        // produce different hashes.
        // We never do this for native functions since some
        // seem to break because of that.
        keys.splice(0, 0, "prototype", "__proto__", "constructor");

        write("object:" + keys.length + ":");
        const self = this;
        return keys.forEach(function (key) {
          self.dispatch(key);
          write(":");
          self.dispatch(object[key]);
          write(",");
        });
      }
    },
    _array: function (arr: Array<any>, unordered: boolean = false): any {
      const self = this;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        return arr.forEach((entry: any) => {
          return self.dispatch(entry);
        });
      }

      // the unordered case is a little more complicated:
      // since there is no canonical ordering on objects,
      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
      // we first serialize each entry using a PassThrough stream
      // before sorting.
      // also: we can’t use the same context array for all entries
      // since the order of hashing should *not* matter. instead,
      // we keep track of the additions to a copy of the context array
      // and add all of them to the global context array when we’re done
      let contextAdditions: Array<any> = [];
      const entries = arr.map((entry: any) => {
        const strm = new PassThrough();
        const localContext = context.slice(); // make copy
        const hasher = typeHasher(options, strm, localContext);
        hasher.dispatch(entry);
        // take only what was added to localContext and append it to contextAdditions
        contextAdditions = contextAdditions.concat(
          localContext.slice(context.length)
        );
        return strm.read().toString();
      });
      context = context.concat(contextAdditions);
      entries.sort();
      return this._array(entries, false);
    },
    _date: function (date: Date) {
      return write("date:" + date.toJSON());
    },
    _symbol: function (sym: Symbol) {
      return write("symbol:" + sym.toString());
    },
    _error: function (err: Error) {
      return write("error:" + err.toString());
    },
    _boolean: function (bool: boolean) {
      return write("bool:" + bool.toString());
    },
    _string: function (string: string) {
      write("string:" + string.length + ":");
      write(string.toString());
    },
    _function: function (fn: Function) {
      write("fn:");
      this.dispatch(fn.toString());
    },
    _number: function (number: number) {
      return write("number:" + number.toString());
    },
    _xml: function (xml: string) {
      return write("xml:" + xml.toString());
    },
    _null: function () {
      return write("Null");
    },
    _undefined: function () {
      return write("Undefined");
    },
    _regexp: function (regex: RegExp) {
      return write("regex:" + regex.toString());
    },
    _uint8array: function (arr: Array<unknown>) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint8clampedarray: function (arr: Uint8ClampedArray) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int8array: function (arr: Int8Array) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint16array: function (arr: Uint16Array) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int16array: function (arr: Int16Array) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint32array: function (arr: Uint32Array) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int32array: function (arr: Int32Array) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float32array: function (arr: Float32Array) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float64array: function (arr: Float64Array) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _arraybuffer: function (arr: ArrayBuffer) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    _url: function (url: URL) {
      return write("url:" + url.toString());
    },
    _map: function (map: Map<unknown, unknown>) {
      write("map:");
      var arr = Array.from(map);
      return this._array(arr, options.unorderedSets !== false);
    },
    _set: function (set: Set<unknown>) {
      write("set:");
      var arr = Array.from(set);
      return this._array(arr, options.unorderedSets !== false);
    },
    _file: function (file: File) {
      write("file:");
      return this.dispatch([
        file.name,
        file.size,
        file.type,
        file.lastModified,
      ]);
    },
    _blob: function () {
      throw Error("Hashing Blob objects is currently not supported.");
    },
    _domwindow: function () {
      return write("domwindow");
    },
    _bigint: function (number: BigInt) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    _process: function () {
      return write("process");
    },
    _timer: function () {
      return write("timer");
    },
    _pipe: function () {
      return write("pipe");
    },
    _tcp: function () {
      return write("tcp");
    },
    _udp: function () {
      return write("udp");
    },
    _tty: function () {
      return write("tty");
    },
    _statwatcher: function () {
      return write("statwatcher");
    },
    _securecontext: function () {
      return write("securecontext");
    },
    _connection: function () {
      return write("connection");
    },
    _zlib: function () {
      return write("zlib");
    },
    _context: function () {
      return write("context");
    },
    _nodescript: function () {
      return write("nodescript");
    },
    _httpparser: function () {
      return write("httpparser");
    },
    _dataview: function () {
      return write("dataview");
    },
    _signal: function () {
      return write("signal");
    },
    _fsevent: function () {
      return write("fsevent");
    },
    _tlswrap: function () {
      return write("tlswrap");
    },
  } as const;
}

class PassThrough {
  buf: string = "";

  write(b: string) {
    this.buf += b;
  }

  end(b: string) {
    this.buf += b;
  }

  read() {
    return this.buf;
  }
}
