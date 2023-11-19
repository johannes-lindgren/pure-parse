import { Validator, ValidatorGuardType } from './utils.ts'

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

export const isUnknown = (data: unknown): data is unknown => true

/*
 * Data Structures
 */

export const isArray = (data: unknown): data is unknown[] => Array.isArray(data)

export const isObject = (data: unknown): data is object =>
  typeof data === 'object' && !isNull(data)

/*
 *
 * Algebraic Data Types
 *
 */

/**
 * "Constant" Types
 */

export const primitive =
  <const T extends null | undefined | boolean | number | string | symbol>(
    constant: T,
  ) =>
  (data: unknown): data is T =>
    data === constant

/**
 * Sum Types
 */

export const union =
  <T extends Validator<unknown>[]>(validators: T) =>
  (data: unknown): data is ValidatorGuardType<T[number]> =>
    validators.some((validator) => validator(data))

export const optional = <T>(is: Validator<T>) => union([isUndefined, is])

/**
 * Product Types
 */

export const tuple =
  <T extends [...Validator<unknown>[]] | []>(schema: T) =>
  (data: unknown): data is { [K in keyof T]: ValidatorGuardType<T[K]> } =>
    isArray(data) &&
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
    }[keyof T]]: ValidatorGuardType<T[K]>
  } & {
    [K in {
      [K in keyof T]-?: typeof isUndefined extends T[K] ? K : never
    }[keyof T]]?: ValidatorGuardType<T[K]>
  } =>
    isObject(data) &&
    Object.keys(schema).every(
      (key) =>
        // @ts-ignore
        schema[key]?.(data[key]),
    )

export const dictionary =
  <T>(isType: Validator<T>) =>
  (data: unknown): data is Record<string, T> =>
    isObject(data) &&
    !isArray(data) &&
    Object.keys(data).every(isString) &&
    Object.values(data).every(isType)
