import { assert, assertEquals, assertFalse, assertThrows } from "deno_testing";
import { Err, Ok } from "./result.ts";

Deno.test("Ok(undefined)", () => {
  assertFalse(Ok(undefined).is_err());
  assert(Ok(undefined).is_ok());
});

Deno.test("Err(undefined)", () => {
  assertFalse(Err(undefined).is_ok());
  assert(Err(undefined).is_err());
});

Deno.test("is_ok true", () => {
  assert(Ok("v").is_ok());
});

Deno.test("is_ok false", () => {
  assertFalse(Err("ERROR").is_ok());
});

Deno.test("is_ok_with Err", () => {
  assertFalse(Err("ERROR").is_ok_with(1));
});

Deno.test("is_ok_with Ok true", () => {
  assert(Ok(1).is_ok_with(1));
});

Deno.test("is_ok_with Ok false", () => {
  assertFalse(Ok(1).is_ok_with(2));
});

Deno.test("is_ok_matching Err", () => {
  assertFalse(Err<number, string>("ERROR").is_ok_matching((v) => v > 1));
});

Deno.test("is_ok_matching Ok true", () => {
  assert(Ok(2).is_ok_matching((v) => v > 1));
});

Deno.test("is_ok_matching Ok false", () => {
  assertFalse(Ok(1).is_ok_matching((v) => v > 1));
});

Deno.test("is_err true", () => {
  assert(Err("v").is_err());
});

Deno.test("is_err false", () => {
  assertFalse(Ok("ERROR").is_err());
});

Deno.test("is_err_with Ok", () => {
  assertFalse(Ok("ERROR").is_err_with(1));
});

Deno.test("is_err_with Err true", () => {
  assert(Err(1).is_err_with(1));
});

Deno.test("is_err_with Err false", () => {
  assertFalse(Err(1).is_err_with(2));
});

Deno.test("is_err_matching Ok", () => {
  assertFalse(Ok<string, number>("RESULT").is_err_matching((v) => v > 1));
});

Deno.test("is_err_matching Err true", () => {
  assert(Err(2).is_err_matching((v) => v > 1));
});

Deno.test("is_err_matching Err false", () => {
  assertFalse(Err(1).is_err_matching((v) => v > 1));
});

Deno.test("Ok expect", () => {
  assertEquals(Ok(35).expect(), 35);
});

Deno.test("Err expect", () => {
  assertThrows(() => Err("ERROR").expect());
});

Deno.test("Err expect msg", () => {
  assertThrows(() => Err("ERROR").expect("msg"),"msg");
});

Deno.test("Err expect_err", () => {
  assertEquals(Err(35).expect_err(), 35);
});

Deno.test("Ok expect_err", () => {
  assertThrows(() => Ok("RESULT").expect_err());
});

Deno.test("Err expect msg", () => {
  assertThrows(() => Ok("RESULT").expect_err("msg"),"msg");
});

Deno.test("or Ok1 Ok2 => Ok1", () => {
  const o = Ok(1).or(Ok(2));
  assert(o.is_ok_with(1));
});

Deno.test("or Ok None => Ok", () => {
  const o = Ok(1).or(Err("ERROR"));
  assert(o.is_ok_with(1));
});

Deno.test("or None Ok => Ok", () => {
  const o = Err("ERROR").or(Ok(1));
  assert(o.is_ok_with(1));
});

Deno.test("or Err1 Err2 => None", () => {
  const o = Err("ERROR1").or(Err("ERROR2"));
  assert(o.is_err_with("ERROR2"));
});

Deno.test("or else Ok1 2 => 1", () => {
  assertEquals(Ok(1).or_else(2), 1);
});

Deno.test("or_else None 2 => 2", () => {
  assertEquals(Err("ERROR").or_else(2), 2);
});

Deno.test("and Ok1 Ok2 => Ok1", () => {
  const o = Ok(1).and(Ok(2));
  assert(o.is_ok_with(2));
});

Deno.test("and Ok None => Ok", () => {
  const o = Ok(1).and(Err("ERROR"));
  assert(o.is_err_with("ERROR"));
});

Deno.test("and None Ok => Ok", () => {
  const o = Err("ERROR").and(Ok(1));
  assert(o.is_err_with("ERROR"));
});

Deno.test("and None None => None", () => {
  const o = Err("ERROR1").and(Err("ERROR2"));
  assert(o.is_err_with("ERROR1"));
});

Deno.test("map Ok(A) => Ok(B)", () => {
  assert(Ok(1).map((_) => "One").is_ok_with("One"));
});

Deno.test("map Err", () => {
  assert(Err("ERROR").map((_) => "One").is_err_with("ERROR"));
});

Deno.test("map_err Ok", () => {
  assert(Ok("RESULT").map_err((_) => "One").is_ok_with("RESULT"));
});

Deno.test("map_err Err(A) => Err(B)", () => {
  assert(Err(1).map_err((_) => "One").is_err_with("One"));
});

Deno.test("as_option Ok => Some", () => {
  assert(Ok("there").as_option().is_some_with("there"));
});

Deno.test("as_option Err => None", () => {
  assert(Err("there").as_option().is_none());
});

Deno.test("switch Err(A) => Ok(A)", () => {
  assert(Err("there").switch().is_ok_with("there"));
});

Deno.test("switch Ok(A) => Err(A)", () => {
  assert(Ok("there").switch().is_err_with("there"));
});