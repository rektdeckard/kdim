export type ProbabilityEvent<T> = {
  value: T;
  p?: number;
};

export class Probability<T> {
  #events: Array<ProbabilityEvent<T>> = [];

  constructor(...events: Array<ProbabilityEvent<T>>) {
    if (!!events.length) {
      this.#events = events;
    }

    // Algorithm: Vose’s Alias Method

    // Initialization:

    // 1. Create arrays Alias and Prob, each of size n.
    // 2. Create two worklists, Small and Large.
    // 3. Multiply each probability by n.
    // 4. For each scaled probability pi:
    //    a. If pi < 1, add i to Small.
    //    b. Otherwise pi ⩾ 1, add i to Large.
    // 5. While Small and Large are not empty: (Large might be emptied first)
    //    a. Remove the first element from Small; call it l.
    //    b. Remove the first element from Large; call it g.
    //    c. Set Prob[l] = pl.
    //    d. Set Alias[l] = g.
    //    e. Set pg = pg + pl − 1. (This is a more numerically stable option)
    //    f. If pg < 1, add g to Small.
    //    g. Otherwise pg ⩾ 1, add g to Large.
    // 6. While Large is not empty:
    //    a. Remove the first element from Large; call it g.
    //    b. Set Prob[g] = 1.
    // 7. While Small is not empty: This is only possible due to numerical instability.
    //    a. Remove the first element from Small; call it l.
    //    b. Set Prob[l] = 1.
  }

  event(event: ProbabilityEvent<T>): this {
    this.#events.push(event);
    return this;
  }

  sample(): ProbabilityEvent<T> {
    // Generation:

    // 1. Generate a fair die roll from an n-sided die; call the side i.
    // 2. Flip a biased coin that comes up heads with probability Prob[i].
    // 3. If the coin comes up “heads”, return i.
    // 4. Otherwise, return Alias[i].

    if (!this.#events.length) throw new RangeError("No events");

    const total = this.#events.reduce(
      (acc, event) => (event.p ? acc + event.p : acc),
      0
    );
    if (total > 1.0) throw new RangeError(">1 total p");
    const rem = 1 - total;

    let roll = Math.random();
    let event = this.#events[0];
    let t = event.p ?? rem;
    let i = 0;
    while (roll > t) {
      i += 1;
      if (this.#events[i]) {
        event = this.#events[i];
        t += event.p ?? rem;
      }
    }

    return event;
  }

  take(): ProbabilityEvent<T> {
    const event = this.sample();
    this.#events = this.#events.filter((e) => e !== event);
    return event;
  }
}
