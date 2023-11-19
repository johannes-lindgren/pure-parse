/*
 * Utility Types
 */

/**
 * A function that return a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type Validator<T> = ((data: unknown) => data is T) & {
  optional?: boolean
}

/**
 * Extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type PredicateType<
  T extends (data: unknown, ...args: unknown[]) => data is unknown,
> = T extends (data: unknown, ...args: unknown[]) => data is infer R
  ? R
  : unknown

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

export const isSymbol = (data: unknown): data is symbol =>
  typeof data === 'symbol'

/**
 * Use to skip validation
 * @param data
 */
export const isUnknown = (data: unknown): data is unknown => true

/*
 *
 * Algebraic Data Types
 *
 */

/*
 * "Constant" Types
 */

export const primitive =
  <const T extends null | undefined | boolean | number | string | symbol>(
    constant: T,
  ) =>
  (data: unknown): data is T =>
    data === constant

/*
 * Sum Types
 */

export const union =
  <T extends Validator<unknown>[]>(validators: T) =>
  (data: unknown): data is PredicateType<T[number]> =>
    validators.some((validator) => validator(data))

export const optional = <T>(is: Validator<T>) => union([isUndefined, is])

/*
 * Product Types
 */

export const tuple =
  <T extends [...Validator<unknown>[]] | []>(schema: T) =>
  (data: unknown): data is { [K in keyof T]: PredicateType<T[K]> } =>
    Array.isArray(data) &&
    data.length === schema.length &&
    schema.every((validator, index) => validator(data[index]))

// NOTE: In TypeScript, it's not possible to remove the union with undefined from an optional property, so the optional
//  types will be types as ?: undefined | ...
// NOTE: The type below is complex. It could be made shorter by defining utility types. But these utility types end up
//  in the final type signature of the type guard (which we don't want) and therefore I am inlining.
/**
 *
 * @param schema
 */
export const record =
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

export const dictionary =
  <T>(isType: Validator<T>) =>
  (data: unknown): data is Record<string, T> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Object.keys(data).every(isString) &&
    Object.values(data).every(isType)

/*
 * Recursive Types
 */

export const array =
  <T>(is: Validator<T>) =>
  (data: unknown): data is T[] =>
    Array.isArray(data) && data.every(is)
