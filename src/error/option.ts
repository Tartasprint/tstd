type Data<T> = { valid: true; value: T } | { valid: false; value: undefined };

export class Optional<T> {
  #data: Data<T>;

  private constructor(valid: boolean, value: T | undefined) {
    //@ts-ignore: this constructor is private, and the only other ways of
    // building an Optional are Some and None, which respect the Data type.
    this.#data = { valid: valid, value: value };
  }

  static Some<T>(v: T): Optional<T> {
    return new Optional(true, v);
  }

  static None<T>(): Optional<T> {
    return new Optional<T>(false, undefined);
  }

  expect(msg?: string): T {
    if (this.#data.valid) {
      return this.#data.value;
    } else throw new Error(msg);
  }

  or(v: Optional<T>): Optional<T> {
    if (this.#data.valid) {
      return this;
    } else {
      return v;
    }
  }

  or_else(v: T): T {
    if (this.#data.valid) {
      return this.#data.value;
    } else {
      return v;
    }
  }

  and(v: Optional<T>): Optional<T> {
    if (this.#data.valid) {
      return v;
    } else {
      return Optional.None();
    }
  }

  map<U>(f: (v: T) => U): Optional<U> {
    if (this.#data.valid) {
      return Optional.Some(f(this.#data.value));
    } else {
      return Optional.None();
    }
  }

  is_some(): boolean {
    return this.#data.valid;
  }

  is_some_with(v: T): boolean {
    return this.#data.valid && this.#data.value === v;
  }

  is_some_matching(f: (v: T) => boolean): boolean{
    return this.#data.valid && f(this.#data.value)
  }

  is_none(): boolean {
    return !this.#data.valid;
  }
}

export const Some = Optional.Some;
export const None = Optional.None;
