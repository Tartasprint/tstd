/**
 * The result of an iteration in an iterator.
 */
type IterateurResult<TYield> = { done: false; value: TYield } | { done: true };


/**
 * A class for enriched iterators.
 */
export abstract class Iterateur<TYield, TIn> {
  abstract next(_input?: TIn): IterateurResult<TYield>;

  /**
   * Maps every yielded element to a new value given by the mapping.
   * @param mapping The mapping to transform the yielded elements of the iterator.
   * @returns A new iterator yielding the mapped values.
   */
  map<TYieldOut>(
    mapping: (input: TYield) => TYieldOut,
  ): Iterateur<TYieldOut, TIn> {
    return new Map(this, mapping);
  }

  /**
   * Filters the yielded elements `e` that verify `filter(e)===true`.
   * @param filter The filter to be applied
   * @returns A new iterator yielding only the filtered values.
   */
  filter(this: Iterateur<TYield,undefined>, filter: (v: TYield) => boolean): Iterateur<TYield,undefined> {
    return new Filter(this, filter)
  }

  /**
   * Checks that every yielded value is `true`. Returns `true` if the iterator is empty.
   * @returns `false` at the first yielded `false`, `true` otherwise.
   */
  every(this: Iterateur<boolean, undefined>): boolean {
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
  some(this: Iterateur<boolean, undefined>): boolean {
    let t = false;
    iterer(this, (v) => {
      t = v;
      return v;
    });
    return t;
  }

  sum(this: Iterateur<number,undefined>): number {
    return this.reduce((acc,v) => acc+v, 0)
  }

  bigsum(this: Iterateur<bigint,undefined>): bigint {
    return this.reduce((acc,v) => acc+v, 0n)
  }

  concat(this: Iterateur<string,undefined>): string {
    return this.reduce((acc,v) => acc+v, "")
  }

  reduce<Acc>(
    this: Iterateur<TYield, undefined>,
    red: (acc: Acc, v: TYield) => Acc,
    acc: Acc,
  ): Acc {
    iterer(this, (v) => {
      acc = red(acc, v);
      return false;
    });
    return acc;
  }

  reduce_mod<Acc>(
    this: Iterateur<TYield, undefined>,
    red: (acc: Acc, v: TYield) => void,
    acc: Acc,
  ): Acc {
    iterer(this, (v) => {
      red(acc, v);
      return false;
    });
    return acc;
  }

  // deno-lint-ignore no-explicit-any
  static from<TY, TI>(iter: Iterator<TY, any, TI>): Iterateur<TY, TI> {
    return new FromIterator(iter);
  }

  collect(this: Iterateur<TYield, undefined>): Array<TYield>{
    return this.reduce_mod((acc, v) => {
      acc.push(v);
    }, [] as TYield[]);
  }
}

class Map<TIn, TYieldIn, TYieldOut> extends Iterateur<TYieldOut, TIn> {
  #map_map: (input: TYieldIn) => TYieldOut;
  #map_iter: Iterateur<TYieldIn, TIn>;
  constructor(
    iter: Iterateur<TYieldIn, TIn>,
    map: (input: TYieldIn) => TYieldOut,
  ) {
    super();
    this.#map_map = map;
    this.#map_iter = iter;
  }

  next(input?: TIn | undefined): IterateurResult<TYieldOut> {
    const result = this.#map_iter.next(input);
    if (result.done === true) return result;
    else {
      return { done: false, value: this.#map_map(result.value) };
    }
  }
}

class Filter<TYield> extends Iterateur<TYield, undefined> {
  #filter_filter: (v: TYield) => boolean;
  #filter_iter: Iterateur<TYield, undefined>;

  constructor(
    iter: Iterateur<TYield, undefined>,
    filter: (v: TYield) => boolean,
  ) {
    super();
    this.#filter_iter = iter;
    this.#filter_filter = filter;
  }

  next(_input?: undefined): IterateurResult<TYield> {
    for (
      let result = this.#filter_iter.next();
      !result.done;
      result = this.#filter_iter.next()
    ) {
      if(this.#filter_filter(result.value)) return result;
    }
    return {done: true}
  }
}

class FromIterator<TYield, TIn> extends Iterateur<TYield, TIn> {
  // deno-lint-ignore no-explicit-any
  #from_iterator_iter: Iterator<TYield, any, TIn>;
  constructor(
    // deno-lint-ignore no-explicit-any
    iter: Iterator<TYield, any, TIn>,
  ) {
    super();
    this.#from_iterator_iter = iter;
  }

  next(input: TIn): IterateurResult<TYield> {
    const r = this.#from_iterator_iter.next(...[input]);
    if (r.done) return { done: true };
    else return { done: false, value: r.value };
  }
}

function iterer<TYield>(
  iter: Iterateur<TYield, undefined>,
  f: (v: TYield) => boolean,
) {
  let done = false;
  while (!done) {
    const n = iter.next();
    done = n.done || f(n.value);
  }
}

interface Store<El> {
  push(el : El): void
}
