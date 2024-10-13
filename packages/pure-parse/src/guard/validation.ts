import { optionalSymbol } from '../internals'
import { isNull, isUndefined } from './primitives'
import { Guard, OptionalGuard } from './types'
import { union } from './union'

/*
 * Sum Types
 */

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param guard
 */
export const optional = <T>(guard: Guard<T>): OptionalGuard<T> =>
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a guard represents an optional value.
   */
  Object.assign(union(isUndefined, guard), {
    [optionalSymbol]: true,
  }) as OptionalGuard<T>

/**
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for `optional(union(isNull, guard))`.
 * @param guard
 */
export const optionalNullable = <T>(guard: Guard<T>) =>
  optional(union(isNull, guard))

/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for `union(isNull, guard)`.
 * @param guard
 */
export const nullable = <T>(guard: Guard<T>) => union(isNull, guard)

/**
 * Create a union with `undefined`, which is different from optional properties. Alias for `union(isUndefined, guard)`.
 * @param guard
 */
export const undefineable = <T>(guard: Guard<T>) => union(isUndefined, guard)

/*
 * Product Types
 */

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
export const record =
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
export const partialRecord =
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

/*
 * Recursive Types
 */

/**
 * Validate arrays
 * @param itemGuard validates every item in the array
 * @return a guard function that validates arrays
 */
export const arrayGuard =
  <T>(itemGuard: Guard<T>): Guard<T[]> =>
  (data: unknown): data is T[] =>
    Array.isArray(data) && data.every(itemGuard)

/**
 * Validate non-empty arrays
 * @param itemGuard validates every item in the array
 * @return a guard function that validates non-empty arrays
 */
export const nonEmptyArray =
  <T>(itemGuard: Guard<T>): Guard<[T, ...T[]]> =>
  (data: unknown): data is [T, ...T[]] =>
    Array.isArray(data) && data.length !== 0 && data.every(itemGuard)
