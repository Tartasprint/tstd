import { assert, assertEquals, assertFalse, assertThrows } from "deno_testing";
import { None, Some } from "./option.ts";

Deno.test("Some(undefined)", () => {
  assertFalse(Some(undefined).is_none());
  assert(Some(undefined).is_some());
});

Deno.test("is_some true", () => {
  assert(Some("v").is_some());
});

Deno.test("is_some false", () => {
  assertFalse(None().is_some());
});

Deno.test("None is_some_with", () => {
  assertFalse(None().is_some_with(1));
});

Deno.test("Some is_some_with true", () => {
  assert(Some(1).is_some_with(1));
});

Deno.test("Some is_some_with false", () => {
  assertFalse(Some(1).is_some_with(2));
});

Deno.test("None is_some_matching", () => {
  assertFalse(None<number>().is_some_matching((v) => v > 1));
});

Deno.test("Some is_some_matching true", () => {
  assert(Some(2).is_some_matching((v) => v > 1));
});

Deno.test("Some is_some_matching false", () => {
  assertFalse(Some(1).is_some_matching((v) => v > 1));
});

Deno.test("is_none false", () => {
  assertFalse(Some("v").is_none());
});

Deno.test("is_none true", () => {
  assert(None().is_none());
});

Deno.test("Some expect", () => {
  assertEquals(Some(35).expect(), 35);
});

Deno.test("None expect", () => {
  assertThrows(() => None().expect());
});

Deno.test("or Some1 Some2 => Some1", () => {
  const o = Some(1).or(Some(2));
  assert(o.is_some_with(1));
});

Deno.test("or Some None => Some", () => {
  const o = Some(1).or(None());
  assert(o.is_some_with(1));
});

Deno.test("or None Some => Some", () => {
  const o = None().or(Some(1));
  assert(o.is_some_with(1));
});

Deno.test("or None None => None", () => {
  const o = None().or(None());
  assert(o.is_none());
});

Deno.test("or else Some1 2 => 1", () => {
  assertEquals(Some(1).or_else(2), 1);
});

Deno.test("or_else None 2 => 2", () => {
  assertEquals(None().or_else(2), 2);
});

Deno.test("and Some1 Some2 => Some1", () => {
  const o = Some(1).and(Some(2));
  assert(o.is_some_with(2));
});

Deno.test("and Some None => Some", () => {
  const o = Some(1).and(None());
  assert(o.is_none());
});

Deno.test("and None Some => Some", () => {
  const o = None().and(Some(1));
  assert(o.is_none());
});

Deno.test("and None None => None", () => {
  const o = None().and(None());
  assert(o.is_none());
});

Deno.test("map Some(A) => Some(B)", () => {
  assert(Some(1).map((_) => "One").is_some_with("One"));
});

Deno.test("map None => None", () => {
  assert(None().map((_) => "One").is_none());
});
