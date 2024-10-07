import { hasKey, OptionalKeys, RequiredKeys } from '../internals'
import { Primitive } from '../common'
import { isNull, isUndefined } from './guards'

/**
 * A function that returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates) on the argument.
 */
export type Guard<T> = (data: unknown) => data is T

/*
 * Higher order functions
 */

/**
 *
 * @param constants compared against `data` with the `===` operator.
 */
export const literal =
  <const T extends readonly [...Primitive[]]>(
    ...constants: T
  ): Guard<T[number]> =>
  (data: unknown): data is T[number] =>
    constants.some((constant) => constant === data)

/*
 * Sum Types
 */

/**
 * Note that the type parameter is an array of guards; it's not a union type.
 * This is because TypeScript doesn't allow you to convert unions to tuples, but it does allow you to convert tuples to unions.
 * Therefore, when you state the type parameter explicitly, provide an array to represent the union:
 * ```ts
 * const isStringOrNumber = union<[string, number]>([isString, isNumber])
 * ```
 * @param guards any of these guard functions must match the data.
 */
export const union =
  <T extends readonly [...unknown[]]>(
    ...guards: {
      [K in keyof T]: Guard<T[K]>
    }
  ) =>
  (data: unknown): data is T[number] =>
    guards.some((guard) => guard(data))

/**
 * Used to represent optional guards at runtime and compile-time in two different ways
 */
const optionalSymbol = Symbol('optional')

/**
 * Special guard to check optional values
 */
export type OptionalGuard<T> = { [optionalSymbol]: true } & ((
  data: unknown,
) => data is typeof optionalSymbol | T | undefined)

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
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for optional(union(isNull, guard)).
 * @param guard
 */
export const optionalNullable = <T>(guard: Guard<T>) =>
  optional(union(isNull, guard))

/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for union(isNull, guard).
 * @param guard
 */
export const nullable = <T>(guard: Guard<T>) => union(isNull, guard)

/**
 * Create a union with `undefined`, which is different from optional properties. Alias for union(isUndefined, guard).
 * @param guard
 */
export const undefineable = <T>(guard: Guard<T>) => union(isUndefined, guard)

/*
 * Product Types
 */

/**
 * @param guards an array of guards. Each guard validates the corresponding element in the data tuple.
 */
export const tuple =
  <T extends readonly [...unknown[]]>(
    guards: [
      ...{
        [K in keyof T]: Guard<T[K]>
      },
    ],
  ): Guard<T> =>
  (data: unknown): data is T =>
    Array.isArray(data) &&
    data.length === guards.length &&
    guards.every((guard, index) => guard(data[index]))

/**
 * Objects have a fixed set of properties that can have different types.
 *
 * ```ts
 * const isUser = object({
 *   id: isNumber,
 *   uid: isString,
 *   active: isBoolean,
 * })
 * ```
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, unknown>>(schema: {
    [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
  }) =>
  (
    data: unknown,
  ): data is Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>> =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every((key) => {
      const guard = schema[key]
      if (guard === undefined) {
        // TODO this shouldn't happen, as the type ensures that all properties are guards
        return false
      }
      if (!hasKey(data, key)) {
        // If the key is not present, the guard must represent an optional property
        return optionalSymbol in guard
      }
      const value = data[key]

      return guard(value)
    })

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
export const array =
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
