import { None, Optional, Some } from "./option.ts";

type Data<R, E> = { valid: true; value: R } | { valid: false; value: E };

export class Result<R, E> {
  #data: Data<R, E>;

  private constructor(valid: boolean, value: R | E) {
    //@ts-ignore: this constructor is private, and the only other ways of
    // building an Optional are Some and None, which respect the Data type.
    this.#data = { valid: valid, value: value };
  }

  static Ok<R, E>(v: R): Result<R, E> {
    return new Result<R, E>(true, v);
  }

  static Err<R, E>(e: E): Result<R, E> {
    return new Result<R, E>(false, e);
  }

  expect(msg?: string): R {
    if (this.#data.valid) {
      return this.#data.value;
    } else {
      if(msg === undefined){
        throw this.#data.value
      } else {
        throw new Error(msg)
      }
    }
  }

  expect_err(msg?: string): E {
    if (this.#data.valid) {
      if(msg === undefined){
        throw this.#data.value
      } else {
        throw new Error(msg)
      }
    } else {
      return this.#data.value;
    }
  }

  or(v: Result<R, E>): Result<R, E> {
    if (this.#data.valid) {
      return this;
    } else {
      return v;
    }
  }

  or_else(v: R): R {
    if (this.#data.valid) {
      return this.#data.value;
    } else {
      return v;
    }
  }

  and(v: Result<R, E>): Result<R, E> {
    return this.#data.valid ? v : this;
  }

  map<U>(f: (v: R) => U): Result<U, E> {
    if (this.#data.valid) {
      return Result.Ok(f(this.#data.value));
    } else {
      return Result.Err(this.#data.value);
    }
  }

  map_err<U>(f: (v: E) => U): Result<R, U> {
    if (this.#data.valid) {
      return Result.Ok(this.#data.value);
    } else {
      return Result.Err(f(this.#data.value));
    }
  }

  is_ok(): boolean {
    return this.#data.valid;
  }

  is_ok_with(v: R): boolean {
    return this.#data.valid && this.#data.value === v;
  }

  is_ok_matching(f: (v: R) => boolean): boolean {
    return this.#data.valid && f(this.#data.value);
  }

  is_err(): boolean {
    return !this.#data.valid;
  }

  is_err_with(e: E): boolean {
    return !this.#data.valid && this.#data.value === e;
  }

  is_err_matching(f: (e: E) => boolean): boolean {
    return !this.#data.valid && f(this.#data.value);
  }

  as_option(): Optional<R> {
    if (this.#data.valid) {
      return Some(this.#data.value);
    } else {
      return None();
    }
  }

  switch(): Result<E, R> {
    if (this.#data.valid) {
      return Result.Err(this.#data.value);
    } else {
      return Result.Ok(this.#data.value);
    }
  }
}

export const Ok = Result.Ok;
export const Err = Result.Err;
