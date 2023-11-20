/*
 * Utility Types
 */

/**
 * A function that return a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type Validator<T> = (data: unknown) => data is T

/**
 * Extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type PredicateType<
  T extends (data: unknown, ...args: unknown[]) => data is unknown,
> = T extends (data: unknown, ...args: unknown[]) => data is infer R
  ? R
  : unknown

/**
 * Use to skip validation, as it returns true for any input.
 * @param data
 */
export const isUnknown = (data: unknown): data is unknown => true

/*
 * Primitives
 */

export const isNull = (data: unknown): data is null => data === null
export const isUndefined = (data: unknown): data is undefined =>
  typeof data === 'undefined'

export const isBoolean = (data: unknown): data is boolean =>
  typeof data === 'boolean'

export const isNumber = (data: unknown): data is number =>
  typeof data === 'number'

export const isString = (data: unknown): data is string =>
  typeof data === 'string'

export const isBigInt = (data: unknown): data is bigint =>
  typeof data === 'bigint'

export const isSymbol = (data: unknown): data is symbol =>
  typeof data === 'symbol'

/*
 *
 * Algebraic Data Types
 *
 */

/*
 * "Constant" Types
 */

/**
 * A JavaScript primitive
 */
export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | bigint
  | symbol

/**
 *
 * @param constant compared against `data` with the `===` operator.
 */
export const literal =
  <const T extends Primitive>(constant: T) =>
  (data: unknown): data is T =>
    data === constant

/*
 * Sum Types
 */

/**
 *
 * @param validators any of these validator functions must match the data.
 */
export const union =
  <T extends Validator<unknown>[]>(validators: T) =>
  (data: unknown): data is PredicateType<T[number]> =>
    validators.some((validator) => validator(data))

/**
 * Create a union with `undefined`. Convenient when creating optional properties in objects. Alias for union([isUndefined, validator]).
 * @param validator
 */
export const optional = <T>(validator: Validator<T>) =>
  union([isUndefined, validator])

/**
 * Create a union with `undefined`. Convenient when creating nullable properties in objects. Alias for union([isNull, validator]).
 * @param validator
 */
export const nullable = <T>(validator: Validator<T>) =>
  union([isNull, validator])

/**
 * Create a union with `undefined`. Convenient when creating optional nullable properties in objects. Alias for union([isUndefined, isNull, validator]).
 * @param validator
 */
export const optionalNullable = <T>(validator: Validator<T>) =>
  union([isUndefined, isNull, validator])

/*
 * Product Types
 */

/**
 * @param validators an array of validators. Each validator validates the corresponding element in the data tuple.
 */
export const tuple =
  <T extends [...Validator<unknown>[]] | []>(validators: T) =>
  (data: unknown): data is { [K in keyof T]: PredicateType<T[K]> } =>
    Array.isArray(data) &&
    data.length === validators.length &&
    validators.every((validator, index) => validator(data[index]))

// NOTE: In TypeScript, it's not possible to remove the union with undefined from an optional property, so the optional
//  types will be types as ?: undefined | ...
// NOTE: The type below is complex. It could be made shorter by defining utility types. But these utility types end up
//  in the final type signature of the type guard (which we don't want) and therefore I am inlining.
/**
 * Validate structs; records that map known keys to a specific type.
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, Validator<unknown>>>(schema: T) =>
  (
    data: unknown,
  ): data is {
    [K in {
      [K in keyof T]-?: typeof isUndefined extends T[K] ? never : K
    }[keyof T]]: PredicateType<T[K]>
  } & {
    [K in {
      [K in keyof T]-?: typeof isUndefined extends T[K] ? K : never
    }[keyof T]]?: PredicateType<T[K]>
  } =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every(
      (key) =>
        // We have force TypeScript to consider `data` as a record, otherwise it won't allow us to index `data` with a string (TS7053).
        schema[key]?.((data as Record<string, unknown>)[key]),
    )

/**
 * Validate `Record`; dictionaries that map strings to another specific type.
 * @param validateValue validates every value in the map
 */
export const record =
  <T>(validateValue: Validator<T>) =>
  (data: unknown): data is Record<string, T> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Object.keys(data).every(isString) &&
    Object.values(data).every(validateValue)

/*
 * Recursive Types
 */

/**
 * @param validateItem validates every item in the array
 */
export const array =
  <T>(validateItem: Validator<T>) =>
  (data: unknown): data is T[] =>
    Array.isArray(data) && data.every(validateItem)
