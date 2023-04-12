import { None } from "../error/option.ts";
import { Provider } from "./provider.ts";
import { assert } from "deno_testing";
import { Some } from "/error/option.ts";

Deno.test("Providing function, key available", () => {
  assert(
    Provider.from((k: string) => k === "yes" ? Some(13) : None()).provide("yes")
      .is_some_with(13),
  );
});

Deno.test("Providing function, key unavailable", () => {
  assert(
    Provider.from((k: string) => k === "yes" ? Some(13) : None()).provide("no")
      .is_none(),
  );
});

Deno.test("Providing map, key available", () => {
  assert(
    Provider.from(new Map([["yes", 13]])).provide("yes")
      .is_some_with(13),
  );
});

Deno.test("Providing map, key unavailable", () => {
  assert(
    Provider.from(new Map([["yes", 13]])).provide("no")
      .is_none(),
  );
});

Deno.test("Providing array, key available", () => {
  assert(
    Provider.from(["yes"]).provide(0)
      .is_some_with("yes"),
  );
});

Deno.test("Providing array, key unavailable", () => {
  assert(
    Provider.from(["yes"]).provide(1)
      .is_none(),
  );
});