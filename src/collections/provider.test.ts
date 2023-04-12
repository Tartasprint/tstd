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

Deno.test("add_v array", () => {
  const a = Provider.from(["GO"]);
  assert(
    a.is_v_extensible(),
    "Since a is an Array, we expect to be able to add a new value to the provider.",
  );
  assert(a.provide(0).is_some_with("GO"), 'a[0]==="GO"');
  assert(a.provide(1).is_none(), "a.length===1");
  assert(a.add_v("GA").is_some_with(1), "a[1]=GA");
  assert(a.provide(1).is_some_with("GA"));
});

Deno.test("add_kv map", () => {
  const a = Provider.from(new Map([["Sheep","Hector"]]));
  assert(
    a.is_kv_extensible(),
    "Since a is a Map, we expect to be able to add a new key/value to the provider.",
  );
  assert(a.provide("Sheep").is_some_with("Hector"), 'a: "Sheep" -> "Hector"');
  assert(a.provide("Goat").is_none(), "a: Goat not defined yet");
  assert(a.add_kv("Goat", "Gwen"), "a[1]=GA");
  assert(a.provide("Goat").is_some_with("Gwen"));
});
