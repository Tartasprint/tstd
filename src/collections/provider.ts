import { None, Optional, Some } from "/error/option.ts";

export abstract class Provider<Key, Value> {
  /**
   * Provides a value for the given key.
   * @param key The key referencing the wanted value.
   * @returns `Some(value)` if a value matching the key was found, `None` otherwise.
   */
  abstract provide(key: Key): Optional<Value>;

  /**
   * Tells wether you can add (key,value) to this provider.
   */
  is_kv_extensible(): this is ExtensibleKVProvider<Key, Value> {
    return this instanceof ExtensibleKVProvider;
  }

  /**
   * Tells wether you can add a value to this provider.
   */
  is_v_extensible(): this is ExtensibleVProvider<Key, Value> {
    return this instanceof ExtensibleVProvider;
  }

  /**
   * Converts common types of "providers" to the appropriate Provider.
   * @param input The Map/Array/function to be converted
   */
  static from<Key, Value>(
    input: (k: Key) => Optional<Value>,
  ): Provider<Key, Value>;
  static from<Key extends number, Value>(
    input: Array<Value>,
  ): ExtensibleVProvider<Key, Value>;
  static from<Key, Value>(
    input: Map<Key, Value>,
  ): ExtensibleKVProvider<Key, Value>;
  static from<Key, Value>(
    input: ((k: Key) => Optional<Value>) | Array<Value> | Map<Key, Value>,
  ): Provider<Key, Value> {
    if (typeof input === "function") {
      return new ProvidingFunction(input);
    } else if (input instanceof Array) {
      //@ts-ignore because of the typing of the overloads, if the input is an Array, then Key extends number.
      return new ProvidingArray(input);
    } else {
      return new ProvidingMap(input);
    }
  }
}

export abstract class ExtensibleKVProvider<
  Key,
  Value,
  ExtensionReturn = boolean,
> extends Provider<Key, Value> {
  /**
   * Adds a key/value pair to the provider.
   * @param key The key to be added
   * @param val The value to be added with respect to `key`
   */
  abstract add_kv(key: Key, val: Value): ExtensionReturn;
}

export abstract class ExtensibleVProvider<Key, Value>
  extends Provider<Key, Value> {
  /**
   * Adds a value pair to the provider.
   * @param val The value to be added with respect to `key`
   * @returns The key corresponding to the added value.
   */
  abstract add_v(val: Value): Optional<Key>;
}

class ProvidingFunction<Key, Value> extends Provider<Key, Value> {
  #f: (k: Key) => Optional<Value>;
  constructor(f: (k: Key) => Optional<Value>) {
    super();
    this.#f = f;
  }

  provide(key: Key): Optional<Value> {
    return this.#f(key);
  }
}

class ProvidingArray<Value> extends ExtensibleVProvider<number, Value> {
  #a: Value[];
  constructor(a: Value[]) {
    super();
    this.#a = a;
  }

  provide(k: number) {
    if (k < this.#a.length) return Some(this.#a[k]);
    else return None<Value>();
  }

  add_v(val: Value): Optional<number> {
    return Some(this.#a.push(val) - 1);
  }
}

class ProvidingMap<Key, Value> extends ExtensibleKVProvider<Key, Value> {
  #m: Map<Key, Value>;
  constructor(m: Map<Key, Value>) {
    super();
    this.#m = m;
  }

  provide(key: Key): Optional<Value> {
    return Optional.from_undefined(this.#m.get(key));
  }

  add_kv(key: Key, val: Value): boolean {
    this.#m.set(key, val);
    return true;
  }
}
