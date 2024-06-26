import { type PRNG, Random } from "./random";

export type ProbabilityEvent<T> = {
  value: T;
  p?: number;
};

export class Probability<T> {
  private _events: Array<ProbabilityEvent<T>> = [];
  private _rng: PRNG;
  private _alias: number[] = [];
  private _prob: number[] = [];
  private _initialized = false;

  constructor(events: ProbabilityEvent<T>[] = [], rng?: PRNG | null) {
    this._rng = rng ?? Random;
    if (!!events.length) {
      this._events = events;
    }
  }

  private _init() {
    const events = this._events;

    // Assign default probabilities if omitted
    let t = 0;
    let d = 0;
    for (const event of events) {
      if (typeof event.p === "number") {
        if (event.p < 0 || event.p > 1) throw new RangeError("invalid event p");
        t += event.p;
      } else {
        d += 1;
      }
    }
    if (t > 1.0) throw new RangeError(">1 total p");
    const rem = 1.0 - t;
    if (1.0 - t - rem > Number.EPSILON) {
      throw new Error("invalid total p");
    }

    this._events = events.map((event) =>
      typeof event.p === "number" ? event : { ...event, p: rem / d }
    );

    // Algorithm: Vose’s Alias Method
    // https://web.archive.org/web/20131029203736/http://web.eecs.utk.edu/~vose/Publications/random.pdf

    // Initialization:

    // 1. Create arrays Alias and Prob, each of size n.
    const n = events.length;
    const alias: number[] = Array(n);
    const prob: number[] = Array(n);

    // 2. Create two worklists, Small and Large.
    const small: number[] = [];
    const large: number[] = [];

    // 3. Multiply each probability by n.
    const ps = events.map(({ p = 0 }) => p * n);

    // 4. For each scaled probability pi:
    for (let i = 0; i < ps.length; i++) {
      if (ps[i] < 1) {
        //    a. If pi < 1, add i to Small.
        small.push(i);
      } else {
        //    b. Otherwise pi ⩾ 1, add i to Large.
        large.push(i);
      }
    }

    // 5. While Small and Large are not empty: (Large might be emptied first)
    while (small.length && large.length) {
      //    a. Remove the first element from Small; call it l.
      const l = small.shift()!;
      //    b. Remove the first element from Large; call it g.
      const g = large.shift()!;
      //    c. Set Prob[l] = pl.
      prob[l] = ps[l];
      //    d. Set Alias[l] = g.
      alias[l] = g;
      //    e. Set pg = pg + pl − 1. (This is a more numerically stable option)
      ps[g] = ps[g] + ps[l] - 1;

      if (ps[g] < 1) {
        //    f. If pg < 1, add g to Small.
        small.push(g);
      } else {
        //    g. Otherwise pg ⩾ 1, add g to Large.
        large.push(g);
      }
    }

    // 6. While Large is not empty:
    while (large.length) {
      //    a. Remove the first element from Large; call it g.
      const g = large.shift()!;
      //    b. Set Prob[g] = 1.
      prob[g] = 1;
    }

    // 7. While Small is not empty: This is only possible due to numerical instability.
    while (small.length) {
      //    a. Remove the first element from Small; call it l.
      const l = small.shift()!;
      //    b. Set Prob[l] = 1.
      prob[l] = 1;
    }

    this._alias = alias;
    this._prob = prob;
    this._initialized = true;
  }

  event(event: ProbabilityEvent<T>): this {
    this._events.push(event);
    this._initialized = false;
    return this;
  }

  sample(): ProbabilityEvent<T> {
    if (!this._initialized) this._init();
    if (!this._events.length) throw new RangeError("No events");
    if (this._events.length === 1) return this._events[0];

    // Algorithm: Vose’s Alias Method
    // Generation:

    // 1. Generate a fair die roll from an n-sided die; call the side i.
    const i = this._rng.dice(this._events.length) - 1;

    // 2. Flip a biased coin that comes up heads with probability Prob[i].
    const heads = this._rng.float() < this._prob[i];

    // 3. If the coin comes up “heads”, return i.
    if (heads) {
      return this._events[i];
    } else {
      // 4. Otherwise, return Alias[i].
      return this._events[this._alias[i]];
    }
  }

  take(): ProbabilityEvent<T> {
    if (!this._initialized) this._init();
    const event = this.sample();
    this._events = this._events.filter((e) => e !== event);
    this._initialized = false;
    return event;
  }
}
