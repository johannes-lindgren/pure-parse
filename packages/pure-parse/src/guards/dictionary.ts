import { Guard } from './types'

/**
 * Dictionaries are objects that map strings to other values. *
 *
 *  Due to how TypeScript works, this function has two behaviors at the type level, depending on `Key` (At runtime, it always behaves the same):
 * - When the key is `string`, it validates `Record<string, V>`. When `noUncheckedIndexedAccess` is enabled, TypeScript understands that a value retrieved with a string the value can be `undefined`. However, the value is _not semantically identical_ to `Partial<Record<string, V>>`.
 * - When the key is a subset of `string`, it validates `Partial<Record<K, V>>`. If the properties were not marked as optional, TypeScript would assume that all keys map to values.
 *
 * @example
 * Validate a dictionary:
 * ```ts
 * const isDictionary = dictionaryGuard(isString, isString)
 * isDictionary({ hello: 'world' }) // -> true
 * ```
 * @example
 * You can limit the set of keys; for example, to only allow lowercase strings:
 * ```ts
 * const isLowerCase = (data: unknown): data is Lowercase<string> =>
 *   typeof data === 'string' && data === data.toLowerCase()
 * const isDictionary = dictionaryGuard(isLowerCase, isString)
 * isDictionary({ hello: 'world' }) // -> true
 * isDictionary({ Hello: 'world' }) // -> false
 * ```
 * @param keyGard validates every key
 * @param valueGuard validates every value
 * @returns a guard for a dictionary
 */
export const dictionaryGuard =
  <Key extends string, Value>(
    keyGard: Guard<Key>,
    valueGuard: Guard<Value>,
  ): Guard<
    string extends Key ? Record<Key, Value> : Partial<Record<Key, Value>>
  > =>
  (
    data: unknown,
  ): data is string extends Key
    ? Record<Key, Value>
    : Partial<Record<Key, Value>> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // No extra keys
    Object.keys(data).every(keyGard) &&
    // Every value is valid
    Object.values(data).every(valueGuard)
