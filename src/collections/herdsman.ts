import { None, Optional, Some } from "/error/option.ts";
import { Iterateur } from "/iter/iter.ts";
import { ExtensibleKVProvider, Provider } from "./provider.ts";

/**
 * Allows to build complex providers. Like herdsman, it distingueshes
 * apparently similar items with their keys!
 */
export class Herdsman<Key, Value>
  extends ExtensibleKVProvider<Key, Value, Optional<number>> {
  #providers: Provider<Key, Value>[];

  constructor(...providers: Provider<Key, Value>[]) {
    super();
    this.#providers = providers;
  }

  provide(key: Key): Optional<Value> {
    return Iterateur.from(this.#providers.values()).first_matching((p) =>
      p.provide(key)
    );
  }

  /**
   * Adds a provider to the available providers, at the end of the list.
   * @param provider The Provider to be added
   * @returns Where the provider was added.
   */
  add_provider(provider: Provider<Key, Value>): number {
    return this.#providers.push(provider);
  }

  add_kv(key: Key, value: Value): Optional<number> {
    return Iterateur.from(this.#providers.values()).enumerate().first_matching<
      [number, ExtensibleKVProvider<Key, Value>]
    >(
      ([index, provider]) => {
        if (provider.is_kv_extensible()) {
          return Some([index, provider]);
        } else return None();
      },
    ).map((p) => {
      p[1].add_kv(key, value);
      return p[0];
    });
  }
}
