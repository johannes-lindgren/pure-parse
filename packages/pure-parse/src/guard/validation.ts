import { OptionalKeys, optionalSymbol, RequiredKeys } from '../internals'
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
 * @example
 * Commonly used in unions:
 * ```ts
 * const isLogLevel = literal('debug', 'info', 'warning', 'error')
 * ```
 * ```ts
 * const isResult = union([
 *  object({
 *    tag: literal('success')
 *  }),
 *  object({
 *    tag: literal('error')
 *   }),
 * ])
 * ```
 * @example
 * Annotating `literal` requires you to wrap it in an array:
 * ```ts
 * const isColor = literal<['red', 'green', 'blue']>('red', 'green', 'blue')
 * ```
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
 *
 * @example
 * Commonly used in discriminated unions:
 * ```ts
 * const isResult = union([
 *  object({
 *    tag: literal('success')
 *  }),
 *  object({
 *    tag: literal('error')
 *   }),
 * ])
 * ```
 * @example
 * Annotating a union literal requires you to wrap the types an array:
 * ```ts
 * const isId = union<[string, number]>(isString, isNumber)
 * ```
 * @param guards any of these guard functions must match the data.
 * @return a guard function that validates unions
 */
export const union =
  <T extends readonly [...unknown[]]>(
    ...guards: {
      [K in keyof T]: Guard<T[K]>
    }
  ) =>
  /**
   * @param data data to be validated
   * @return `true` if the data is in the specified union
   */
  (data: unknown): data is T[number] =>
    guards.some((guard) => guard(data))

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
 * Same as {@link objectGuard}, but does not perform just-in-time (JIT) compilation with the `Function` constructor. This function is needed as a replacement in environments where `new Function()` is disallowed; for example, when the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) policy is set without the `'unsafe-eval`' directive.
 */
export const objectGuardNoJit =
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
      const guard = schema[key]!
      const value = (data as Record<string, unknown>)[key]
      if (value === undefined && !data.hasOwnProperty(key)) {
        // If the key is not present, the guard must represent an optional property
        return optionalSymbol in guard
      }

      return guard(value)
    })

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
export const objectGuard = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
}) => {
  const schemaEntries = Object.entries(schema)
  const guards = schemaEntries.map(([_, guard]) => guard)
  const body = [`return typeof data === 'object'`, `data !== null`]
    .concat(
      schemaEntries.map(([unescapedKey, guardFunction], i) => {
        const sanitizedKey = JSON.stringify(unescapedKey)
        const value = `data[${sanitizedKey}]`
        const guard = `guards[${i}]`
        const isOptional = guardFunction[optionalSymbol] === true
        return isOptional
          ? `(${value} === undefined && !data.hasOwnProperty(${sanitizedKey}) || ${guard}(${value}))`
          : `(${value} === undefined && !data.hasOwnProperty(${sanitizedKey}) ? false : ${guard}(${value}))`
      }),
    )
    .join(' && ')
  const fun = new Function('data', 'optionalSymbol', 'guards', body)
  return (
    data: unknown,
  ): data is Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>> => fun(data, optionalSymbol, guards)
}

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
