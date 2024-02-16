import { Comparator } from "../data";
import type { Add, Sub, Mul, Div, Pow, Abs, Eq } from "./types";

export type ArithmethicObject<T extends Number> = Add<[T] | [number], T> &
  Sub<[T] | [number], T> &
  Mul<[T] | [number], T> &
  Div<[T] | [number], T> &
  Pow<[T] | [number], T> &
  Eq<[T] | [number]> &
  Abs<T>;

export type Arithmetic<T extends Number> = number | ArithmethicObject<T>;

export type FiveNumberSummary<T extends Number> = {
  q0: T;
  q1: T;
  q2: T;
  q3: T;
  q4: T;
};

export const QUARTILES = [0, 0.25, 0.5, 0.75, 1];

export type InterpolationMethod =
  | "midpoint"
  | "nearest"
  | "hrank"
  | "lrank"
  | "weighted"
  | "outer";

export type SummaryOptions = {
  method?: InterpolationMethod;
};

export type PercentileOptions = SummaryOptions & {
  p: number[];
};

export class Statistics {
  constructor(..._: never) {
    throw new Error(
      "Statistics contains static methods only and is not meant to be constructed"
    );
  }

  static #sorted<T extends Number & Arithmetic<T>>(data: T[]): T[] {
    const sorted = [...data];
    sorted.sort(Comparator.numericCompare);
    return sorted;
  }

  /**
   * Find the minimum value of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static min<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    return Statistics.#sorted(data)[0];
  }

  /**
   * Find the maximum value of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static max<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    return Statistics.#sorted(data)[data.length - 1];
  }

  /**
   * Calculate the Mean of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static mean<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    if (data.length === 0) return;

    if (typeof data[0] === "number") {
      return ((data as number[]).reduce((acc, curr) => acc + curr, 0) /
        data.length) as T;
    } else {
      let sum = data[0] as ArithmethicObject<T>;
      for (let i = 1; i < data.length; i++) {
        sum = sum.add(data[i]) as ArithmethicObject<T>;
      }
      return sum.div(data.length);
    }
  }

  /**
   * Calculate the Median of a data set, using the mean of the two
   * central values if the data set has an even number of elements.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static median<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    if (data.length === 0) return;

    const sorted = this.#sorted(data);
    const centerpoints = (
      sorted.length % 2 === 0
        ? [sorted.length / 2 - 1, sorted.length / 2]
        : [Math.floor(sorted.length / 2)]
    ).map((i) => sorted[i]);

    return Statistics.mean(centerpoints);
  }

  /**
   * Calculate the Mode of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static mode<T extends Number & Arithmetic<T>>(data: T[]) {
    if (data.length === 0) return;

    const sorted = this.#sorted(data);

    // const countss = sorted.reduce((acc, curr) => {
    //     if (typeof curr === "number") {
    //         if (curr === last) {
    //             acc += 1;
    //         }
    //     }else {
    //         if (!curr.eq(last!)) {}
    //     }
    //     return acc;
    // }, {});

    // let stride = 0;
    // let last: T | undefined = undefined;
    // for(let el of sorted) {
    //     if(last === undefined) {
    //         last = el;
    //         stride = 1;
    //         continue;
    //     }

    //     if (typeof el === "number") {
    //         if (el === last) {
    //             stride += 1;

    //         }
    //     } else {
    //         if (!el.eq(last))
    //     }
    // }

    const counts = new Map<string | number, number>();
    for (let element of sorted) {
      if (typeof element === "number") {
        if (counts.has(element)) {
          counts.set(element, counts.get(element)! + 1);
        } else {
          counts.set(element, 1);
        }
      } else {
        throw new Error("NOT IMPLEMENTED");
        // const key = element.toString();
        // if (counts.has(key)) {
        //   counts.set(key, counts.get(key)! + 1);
        // } else {
        //   counts.set(key, 1);
        // }
      }
    }

    const modeCount = Math.max(...counts.values());
    if (modeCount === 1) return;
    return Array.from(counts.entries())
      .filter((e) => e[1] === modeCount)
      .map((e) => e[0]);
  }

  /**
   * Calculate the Variance of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static variance<T extends Number & Arithmetic<T>>(data: T[]) {
    const mean = Statistics.mean(data);
    if (mean === undefined) return;

    const sqdv = (
      typeof mean === "number"
        ? data.map((v) => {
            return Math.pow((v as number) - mean, 2);
          })
        : data.map((v) => {
            const dv = (v as ArithmethicObject<T>).sub(
              mean as T
            ) as ArithmethicObject<T>;
            return dv.mul(dv as T);
          })
    ) as T[];

    return Statistics.mean(sqdv);
  }

  /**
   * Calculate the Standard Deviation of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static sd<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    const variance = Statistics.variance(data);
    if (!variance) return;

    return typeof variance === "number"
      ? (Math.sqrt(variance) as T)
      : variance.pow(1 / 2);
  }

  /**
   * Calculate the Standard Error of the Mean of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static sem<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    const sd = Statistics.sd(data);
    if (sd === undefined) return;

    return typeof sd === "number"
      ? ((sd / Math.sqrt(data.length)) as T)
      : sd.div(Math.sqrt(data.length));
  }

  /**
   * Calculate the Absolute Range of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static range<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    if (data.length === 0) return;

    const [min, max] = [Statistics.min(data), Statistics.max(data)];
    if (min === undefined || max === undefined) return;

    if (typeof min === "number" && typeof max === "number") {
      return (max - min) as T;
    } else {
      return (max as ArithmethicObject<T>).sub(min as T);
    }
  }

  /**
   * Calculate the Inter-Quartile Range of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static iqr<T extends Number & Arithmetic<T>>(
    data: T[],
    options?: SummaryOptions
  ): T | undefined {
    const summary = Statistics.summary(data, options);
    if (summary === undefined) return;

    if (typeof summary.q1 === "number" && typeof summary.q3 === "number") {
      return (summary.q3 - summary.q1) as T;
    } else {
      return (summary.q3 as ArithmethicObject<T>).sub(summary.q1 as T);
    }
  }

  /**
   * Calculate the Median Absolute Deviation of a data set.
   *
   * @param data An array of number or object number types
   * @returns A number or object number type
   */
  static mad<T extends Number & Arithmetic<T>>(data: T[]): T | undefined {
    const med = Statistics.median(data);
    const absdvs = data.map((v) => {
      if (typeof v === "number") {
        return Math.abs((med as number) - v) as T;
      } else {
        return (
          (med as ArithmethicObject<T>).sub(v) as ArithmethicObject<T>
        ).abs();
      }
    });

    return Statistics.median(absdvs);
  }

  /**
   *
   * @param data An array of number or object number types
   * @param percentiles
   * @returns
   */
  static percentiles<T extends Number & Arithmetic<T>>(
    data: T[],
    options: PercentileOptions | number[] = { p: QUARTILES }
  ): T[] | undefined {
    if (data.length === 0) return;

    const { p: ps, method = "midpoint" } = Array.isArray(options)
      ? { p: options }
      : options;
    if (ps.length === 0) return;
    if (ps.some((p) => p > 1 || p < 0)) {
      throw new Error(`Invalid percentiles ${ps}`);
    }

    const sorted = Statistics.#sorted(data);

    switch (method) {
      case "midpoint": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            return Statistics.mean<T>([
              sorted[Math.floor(fi)],
              sorted[Math.ceil(fi)],
            ])!;
          }
        });
      }
      case "outer": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            if (p === 0.5)
              return Statistics.mean<T>([
                sorted[Math.floor(fi)],
                sorted[Math.ceil(fi)],
              ])!;
            const ri = p > 0.5 ? Math.ceil(fi) : Math.floor(fi);
            return sorted[ri];
          }
        });
      }
      case "hrank": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            return sorted[Math.ceil(fi)];
          }
        });
      }
      case "lrank": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            return sorted[Math.floor(fi)];
          }
        });
      }
      case "nearest": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            return sorted[Math.round(fi)];
          }
        });
      }
      case "weighted": {
        return ps.map((p) => {
          const fi = p * (sorted.length - 1);
          if (Number.isInteger(fi)) {
            return sorted[fi];
          } else {
            const ri = Math.trunc(fi);
            const rf = fi % 1;
            const vi = sorted[ri];
            if (typeof vi === "number") {
              return (vi + rf * ((sorted[ri + 1] as number) - vi)) as T;
            } else {
              return vi.add(
                (
                  (sorted[ri + 1] as ArithmethicObject<T>).sub(
                    vi
                  ) as ArithmethicObject<T>
                ).mul(rf)
              );
            }
          }
        });
      }
      default:
        throw new Error(`Unrecognized interpolation method ${method}`);
    }
  }

  /**
   * Calculate the Five-number Summary of a data set, using
   *
   * @param data An array of number or object number types
   * @returns A summary consisting of min (q0), first quartile (q1),
   * median (q2), third quartile (q3) and max (q4).
   */
  static summary<T extends Number & Arithmetic<T>>(
    data: T[],
    options?: SummaryOptions
  ): FiveNumberSummary<T> | undefined {
    if (data.length === 0) return;

    // if (options?.method === "outer") {
    //   const sorted = this.#sorted(data);
    //   const [lh, uh] =
    //     sorted.length % 2 === 0
    //       ? [
    //           sorted.slice(0, sorted.length / 2),
    //           sorted.slice(sorted.length / 2),
    //         ]
    //       : [
    //           sorted.slice(0, Math.floor(sorted.length / 2)),
    //           sorted.slice(Math.ceil(sorted.length / 2)),
    //         ];

    //   return {
    //     q0: lh[0],
    //     q1: Statistics.median(lh)!,
    //     q2: Statistics.median(sorted)!,
    //     q3: Statistics.median(uh)!,
    //     q4: uh[uh.length - 1],
    //   };
    // } else {
    const ps = Statistics.percentiles(data, { ...options, p: QUARTILES });
    if (ps === undefined) return;

    return {
      q0: ps[0],
      q1: ps[1],
      q2: ps[2],
      q3: ps[3],
      q4: ps[4],
    };
    // }
  }
}
