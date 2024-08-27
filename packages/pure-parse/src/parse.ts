import {
  isBigInt,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
  OptionalKeys,
  Primitive,
  RequiredKeys,
} from './validation'
import * as V from './validation'

export type ParseSuccess<T> = {
  tag: 'success'
  value: T
}

export type ParseFailure = {
  tag: 'failure'
  error: string
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  value,
})

const failure = (error: string): ParseFailure => ({
  tag: 'failure',
  error,
})

export type Parser<T> = (data: unknown) => ParseResult<T>
export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>

/*
 * Utility types
 */

export type Infer<T extends Parser<unknown>> = T extends Parser<infer D>
  ? D
  : never

/*
 * Utility functions
 */

export const fallback =
  <T, D>(parser: Parser<T>, defaultValue: D): InfallibleParser<T | D> =>
  (data) => {
    const result = parser(data)
    if (result.tag === 'failure') {
      return success(defaultValue)
    }
    return result
  }

/**
 * Use to skip validation, as it returns true for any input.
 * @param data
 */
export const parseUnknown = (data: unknown): ParseResult<unknown> =>
  success(data)

/*
 * Primitives
 */

export const parseUndefined = (data: unknown): ParseResult<undefined> =>
  isUndefined(data) ? success(data) : failure('Not undefined')

export const parseNull = (data: unknown): ParseResult<null> =>
  isNull(data) ? success(data) : failure('Not null')

export const parseBoolean = (data: unknown): ParseResult<boolean> =>
  isBoolean(data) ? success(data) : failure('Not a boolean')

export const parseNumber = (data: unknown): ParseResult<number> =>
  isNumber(data) ? success(data) : failure('Not a number')

export const parseString = (data: unknown): ParseResult<string> =>
  isString(data) ? success(data) : failure('Not a string')

export const parseBigInt = (data: unknown): ParseResult<bigint> =>
  isBigInt(data) ? success(data) : failure('Not a bigint')

export const parseSymbol = (data: unknown): ParseResult<symbol> =>
  isSymbol(data) ? success(data) : failure('Not a symbol')

/*
 * Higher order functions
 */

/**
 *
 * @param constants compared against `data` with the `===` operator.
 */
export const literal = <const T extends readonly [...Primitive[]]>(
  ...constants: T
): Parser<T[number]> => {
  const v = V.literal(...constants)
  return (data: unknown) =>
    v(data)
      ? success(data as T[number])
      : failure(`Not a literal of: ${JSON.stringify(constants)}`)
}

/*
 * Sum Types
 */

/**
 * Note that the type parameter is an array of validators; it's not a union type.
 * This is because TypeScript doesn't allow you to convert unions to tuples, but it does allow you to convert tuples to unions.
 * Therefore, when you state the type parameter explicitly, provide an array to represent the union:
 * ```ts
 * const isStringOrNumber = union<[string, number]>([isString, isNumber])
 * ```
 * @param parsers any of these validator functions must match the data.
 */
export const union =
  <T extends readonly [...unknown[]]>(
    ...parsers: {
      [K in keyof T]: Parser<T[K]>
    }
  ): Parser<T[number]> =>
  (data: unknown) => {
    for (const parser of parsers) {
      const result = parser(data)
      if (result.tag === 'success') {
        return result
      }
    }
    return failure('No parser in the union matched')
  }

/**
 * Used to represent optional validators at runtime and compile-time in two different ways
 */
const optionalSymbol = Symbol('optional parser')

/**
 * Special validator to check optional values
 */
export type OptionalParser<T> = {
  [optionalSymbol]: true
} & ((data: unknown) => typeof optionalSymbol)

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param parser
 */
export const optional = <T>(parser: Parser<T>): OptionalParser<T> =>
  /*
   * This function uses two tricks:
   *  1. { [optionalValue]: true } is used at runtime by `object` to check if a validator represents an optional value.
   *  2. The return type is a symbol so that it in generic conditional expressions, it does not overlap with Validator.
   */
  Object.assign(union(parseUndefined, parser), {
    [optionalSymbol]: true,
  }) as OptionalParser<T>

/*
 * Product types
 */

/**
 * Local helper function
 * @param results
 */
const areAllSuccessesObject = <T>(
  results: [string, ParseResult<T>][],
): results is [string, ParseSuccess<T>][] =>
  results.every(([, result]) => result.tag === 'success')

/**
 * Validate structs; records that map known keys to a specific type.
 *
 * ```ts
 * const parseUser = object({
 *   id: parseNumber,
 *   uid: parseString,
 *   active: parseBoolean,
 *   name: optional(parseString),
 * })
 * ```
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, unknown>>(schema: {
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalParser<T[K]>
      : Parser<T[K]>
  }): Parser<
    Required<Pick<T, RequiredKeys<T>>> & Partial<Pick<T, OptionalKeys<T>>>
  > =>
  (data) => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const results = Object.keys(schema).map((key) => {
      const parser = schema[key]
      if (parser === undefined) {
        // TODO this shouldn't happen, as the type ensures that all properties are validators
        return [key, failure('No parser for the key')]
      }
      if (!(key in data)) {
        // If the key is not present, the validator must represent an optional property
        return [
          key,
          optionalSymbol in parser
            ? success(optionalSymbol)
            : failure('Key is missing'),
        ]
      }
      // @ts-ignore - we check that the key is present on the line above
      return [key, parser(data[key])]
    })
    if (!areAllSuccessesObject(results)) {
      return failure('Not all properties are valid')
    }
    return success(
      Object.fromEntries(
        results
          .filter(([key, result]) => result.value !== optionalSymbol)
          .map(([key, result]) => [key, result.value]),
      ),
    )
  }

/*
 * Recursive Types
 */

/**
 * Local helper function
 * @param results
 */
const areAllSuccesses = <T>(
  results: ParseResult<T>[],
): results is ParseSuccess<T>[] =>
  results.every((result) => result.tag === 'success')

/**
 * Validate arrays
 * @param validateItem validates every item in the array
 * @return a validator function that validates arrays
 */
export const array =
  <T>(parseItem: Parser<T>): Parser<T[]> =>
  (data: unknown) => {
    if (!Array.isArray(data)) {
      return failure('Not an array')
    }
    const results: ParseResult<T>[] = data.map(parseItem)
    if (!areAllSuccesses(results)) {
      return failure('Not all items in the array are valid')
    }
    return success(results.map((result) => result.value))
  }
