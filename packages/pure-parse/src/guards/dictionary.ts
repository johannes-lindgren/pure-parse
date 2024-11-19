import { Guard } from './types'

/**
 * Dictionaries are objects where all properties are optional and have the same type.
 * In TypeScript, this can be represented by `Partial<Record<string, ?>>`.
 * @example
 * Validate a word dictionary:
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
 * @returns a guard for a dictionary, of type `Partial<Record<K, V>>`
 */
export const dictionaryGuard =
  <Key extends string, Value>(
    keyGard: Guard<Key>,
    valueGuard: Guard<Value>,
  ): Guard<Partial<Record<Key, Value>>> =>
  (data: unknown): data is Partial<Record<Key, Value>> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // No extra keys
    Object.keys(data).every(keyGard) &&
    // Every value is valid
    Object.values(data).every(valueGuard)
