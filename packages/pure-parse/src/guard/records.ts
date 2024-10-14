import { Guard } from './types'

/**
 * Records have a fixed set of keys that all map to the same type. Can be described with the [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) utility type; for example:
 * ```ts
 * const isPalette = record(
 *  ['success', 'info', 'warning', 'error'],
 *  parseString
 * )
 * ```
 * @param keys validates every key
 * @param valueGuard validates every value
 */
export const recordGuard =
  <Keys extends readonly [...string[]], Value>(
    keys: Keys,
    valueGuard: Guard<Value>,
  ): Guard<Record<Keys[number], Value>> =>
  (data: unknown): data is Record<Keys[number], Value> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // No extra keys
    Object.keys(data).every((key) => keys.includes(key)) &&
    // Every value is valid
    Object.values(data).every(valueGuard) &&
    // Either: a) undefined is a valid value, or b) every key is present
    (valueGuard(undefined) || keys.every((key) => key in data))
/**
 * Partial records are records with a known set of keys, but where not all keys map to values.
 * That is, every property is optional. In TypeScript, this can be represented by `Record<string, ?>`, or `Partial<Record<?, ?>>`:
 * ```ts
 * // words -> description
 * const isDictionary = partialRecord(isString, isString)
 * ```
 * @param keyGard validates every key
 * @param valueGuard validates every value
 */
export const partialRecordGuard =
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
