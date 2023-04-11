import { None, Optional, Some } from "/error/option.ts";

/**
 * The result of an iteration in an iterator.
 */
type IterateurResult<TYield> = { done: false; value: TYield } | { done: true };

/**
 * A class for enriched iterators.
 */
export abstract class Iterateur<TYield> {
  abstract next(): IterateurResult<TYield>;

  /**
   * Maps every yielded element to a new value given by the mapping.
   * @param mapping The mapping to transform the yielded elements of the iterator.
   * @returns A new iterator yielding the mapped values.
   */
  map<TYieldOut>(
    mapping: (input: TYield) => TYieldOut,
  ): Iterateur<TYieldOut> {
    return new Map(this, mapping);
  }

  /**
   * Maps every yielded element to a new value given by the mapping, keeping
   * record of a state.
   * @param mapping The mapping to transform the yielded elements of the iterator.
   * The output is an object with properties `out` for the desired output value and `state`
   * for the new state.
   * @param state The initial state
   * @returns A new iterator yielding the mapped values.
   */
  map_stateful<TState, TYieldOut>(
    map: (input: TYield, state: TState) => { out: TYieldOut; state: TState },
    state: TState,
  ): Iterateur<TYieldOut> {
    return new MapStateful(this, map, state);
  }

  /**
   * Filters the yielded elements `e` that verify `filter(e)===true`.
   * @param filter The filter to be applied
   * @returns A new iterator yielding only the filtered values.
   */
  filter(
    filter: (v: TYield) => boolean,
  ): Iterateur<TYield> {
    return new Filter(this, filter);
  }

  /**
   * Checks that every yielded value is `true`. Returns `true` if the iterator is empty.
   * @returns `false` at the first yielded `false`, `true` otherwise.
   */
  every(this: Iterateur<boolean>): boolean {
    let t = true;
    iterer(this, (v) => {
      t = v;
      return !v;
    });
    return t;
  }

  /**
   * Checks that one of the yielded values is `true`. Returns `false` if the iterator is empty.
   * @returns `false` at the first yielded `false`, `true` otherwise.
   */
  some(this: Iterateur<boolean>): boolean {
    let t = false;
    iterer(this, (v) => {
      t = v;
      return v;
    });
    return t;
  }

  /**
   * Computes the total sum of a Iterator<number> by consuming it.
   * @returns The sum.
   */
  sum(this: Iterateur<number>): number {
    return this.reduce((acc, v) => acc + v, 0);
  }

  /**
   * Computes the total sum of a Iterator<bigint> by consuming it.
   * @returns The sum.
   */
  bigsum(this: Iterateur<bigint>): bigint {
    return this.reduce((acc, v) => acc + v, 0n);
  }

  /**
   * Concatenates every item of the `Iterateur<string>` by consuming it.
   * @returns The concatenated strings.
   */
  concat(this: Iterateur<string>): string {
    return this.reduce((acc, v) => acc + v, "");
  }

  /**
   * Returns the first available item in the iterator, if any.
   * @returns the first item
   */
  first(): Optional<TYield> {
    const r = this.next();
    if (r.done) return None();
    else return Some(r.value);
  }

  /**
   * Gets the first item in the iterator, if any.
   * If `matching` is specified only the first item `i` verifying `matching(i)` is returned.
   * @param matching
   * @returns `Some(firstmatch)` if any, `None()` otherwise.
   */
  first_matching<Out>(
    matching: (v: TYield) => Optional<Out>,
  ): Optional<Out> {
    let match = None<Out>();
    iterer(this, (v) => {
      match = matching(v);
      return match.is_some();
    });
    return match;
  }

  /**
   * Reduces an iterator to a value by updating item by item an accumulator.
   * @param red The reducer
   * @param acc The accumulator
   * @returns The last accumulator
   */
  reduce<Acc>(
    red: (acc: Acc, v: TYield) => Acc,
    acc: Acc,
  ): Acc {
    iterer(this, (v) => {
      acc = red(acc, v);
      return false;
    });
    return acc;
  }

  /**
   * Reduces an iterator to a value by modifying item by item an accumulator.
   * @param red The reducer
   * @param acc The accumulator
   * @returns The last accumulator
   */
  reduce_mod<Acc>(
    red: (acc: Acc, v: TYield) => void,
    acc: Acc,
  ): Acc {
    iterer(this, (v) => {
      red(acc, v);
      return false;
    });
    return acc;
  }

  /**
   * Allows to enrich JS iterators into Iterateur.
   * @param iter Some JS iterable to be enriched
   * @returns The enriched version of the iterator
   */
  // deno-lint-ignore no-explicit-any
  static from<TY>(iter: Iterator<TY, any, undefined>): Iterateur<TY> {
    return new FromIterator(iter);
  }

  /**
   * Collects the items of an iterator into an Array.
   * @returns The collected items
   */
  collect(): Array<TYield> {
    return this.reduce_mod((acc, v) => {
      acc.push(v);
    }, [] as TYield[]);
  }

  /**
   * Returns an enumeration of the iterator: 0,i(0);1,i(1);...
   * @returns Iterator of index,value
   */
  enumerate(): Iterateur<[number, TYield]> {
    return this.map_stateful((i, s) => {
      return { out: [s, i], state: s + 1 };
    }, 0);
  }
}

class Map<TYieldIn, TYieldOut> extends Iterateur<TYieldOut> {
  #map_map: (input: TYieldIn) => TYieldOut;
  #map_iter: Iterateur<TYieldIn>;
  constructor(
    iter: Iterateur<TYieldIn>,
    map: (input: TYieldIn) => TYieldOut,
  ) {
    super();
    this.#map_map = map;
    this.#map_iter = iter;
  }

  next(): IterateurResult<TYieldOut> {
    const result = this.#map_iter.next();
    if (result.done === true) return result;
    else {
      return { done: false, value: this.#map_map(result.value) };
    }
  }
}

class MapStateful<TYieldIn, TYieldOut, TState> extends Iterateur<TYieldOut> {
  #map_map: (
    input: TYieldIn,
    state: TState,
  ) => { out: TYieldOut; state: TState };
  #map_iter: Iterateur<TYieldIn>;
  #state: TState;
  constructor(
    iter: Iterateur<TYieldIn>,
    map: (input: TYieldIn, state: TState) => { out: TYieldOut; state: TState },
    state: TState,
  ) {
    super();
    this.#map_map = map;
    this.#map_iter = iter;
    this.#state = state;
  }

  next(): IterateurResult<TYieldOut> {
    const result = this.#map_iter.next();
    if (result.done === true) return result;
    else {
      const { out, state } = this.#map_map(result.value, this.#state);
      this.#state = state;
      return { done: false, value: out };
    }
  }
}

class Filter<TYield> extends Iterateur<TYield> {
  #filter_filter: (v: TYield) => boolean;
  #filter_iter: Iterateur<TYield>;

  constructor(
    iter: Iterateur<TYield>,
    filter: (v: TYield) => boolean,
  ) {
    super();
    this.#filter_iter = iter;
    this.#filter_filter = filter;
  }

  next(): IterateurResult<TYield> {
    for (
      let result = this.#filter_iter.next();
      !result.done;
      result = this.#filter_iter.next()
    ) {
      if (this.#filter_filter(result.value)) return result;
    }
    return { done: true };
  }
}

class FromIterator<TYield> extends Iterateur<TYield> {
  // deno-lint-ignore no-explicit-any
  #from_iterator_iter: Iterator<TYield, any, undefined>;
  constructor(
    // deno-lint-ignore no-explicit-any
    iter: Iterator<TYield, any, undefined>,
  ) {
    super();
    this.#from_iterator_iter = iter;
  }

  next(): IterateurResult<TYield> {
    const r = this.#from_iterator_iter.next();
    if (r.done) return { done: true };
    else return { done: false, value: r.value };
  }
}

function iterer<TYield>(
  iter: Iterateur<TYield>,
  f: (v: TYield) => boolean,
) {
  let done = false;
  while (!done) {
    const n = iter.next();
    done = n.done || f(n.value);
  }
}
