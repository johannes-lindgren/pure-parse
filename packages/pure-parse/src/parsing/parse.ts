import {
  isBigInt,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
  Primitive,
} from '../validation'
import * as V from '../validation'
import { hasKey } from '../internals'

/**
 * The data adheres to the schema. The `value` is equal to the parsed data
 */
export type ParseSuccess<T> = {
  tag: 'success'
  // TODO remove isSuccess
  isSuccess: true
  value: T
}

/**
 * The data did not adhere to the schema, but the fallback returned a valid data. The `value` is _not_ equal to the parsed data
 */
export type ParseSuccessFallback<T> = {
  tag: 'success-fallback'
  isSuccess: true
  value: T
}

/**
 * The property is absent, but it's optional which means that the parsing was successful.
 */
export type ParseSuccessPropAbsent = {
  tag: 'success-prop-absent'
  isSuccess: true
}

/**
 * The parsing failed.
 */
export type ParseFailure = {
  tag: 'failure'
  isSuccess: false
  error: string
}

export type ParseResult<T> =
  | ParseSuccess<T>
  | ParseFailure
  | ParseSuccessFallback<T>
  | ParseSuccessPropAbsent

export type RequiredParseResult<T> =
  | ParseSuccess<T>
  | ParseFailure
  | ParseSuccessFallback<T>

export type OptionalParseResult<T> = ParseResult<T>

export const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  isSuccess: true,
  value,
})

export const successFallback = <T>(value: T): ParseSuccessFallback<T> => ({
  tag: 'success-fallback',
  isSuccess: true,
  value,
})

export const successOptional = (): ParseSuccessPropAbsent => ({
  tag: 'success-prop-absent',
  isSuccess: true,
})

export const failure = (error: string): ParseFailure => ({
  tag: 'failure',
  isSuccess: false,
  error,
})

export type Parser<T> = (data: unknown) => ParseResult<T>

export type RequiredParser<T> = (data: unknown) => RequiredParseResult<T>

/**
 * Special validator to check optional values
 */
export type OptionalParser<T> = {
  [optionalSymbol]?: true
} & ((data: unknown) => OptionalParseResult<T | undefined>)

export type InfallibleParser<T> = (
  data: unknown,
) => ParseSuccess<T> | ParseSuccessFallback<T>
export type FallibleParser<T> = (
  data: unknown,
) => ParseSuccess<T> | ParseFailure

/*
 * Utility types
 */

export type Infer<T extends Parser<unknown>> = T extends Parser<infer D>
  ? D
  : never

/*
 * Utility functions
 */

// TODO implement
export const memoize = <T>(parser: Parser<T>): Parser<T> => {
  throw new Error('Not implemented')
}

export const fallback =
  <T, F>(parser: Parser<T>, defaultValue: F): InfallibleParser<T | F> =>
  (data: unknown): ParseSuccess<T> | ParseSuccessFallback<F> => {
    const result = parser(data)
    if (result.tag !== 'success') {
      return successFallback(defaultValue)
    }
    return result
  }

/**
 * Use to skip validation, as it returns true for any input.
 * @param data
 */
export const parseUnknown = (data: unknown): ParseSuccess<unknown> =>
  success(data)

/*
 * Primitives
 */

export const parseUndefined = (
  data: unknown,
): ParseSuccess<undefined> | ParseFailure =>
  isUndefined(data) ? success(data) : failure('Not undefined')

export const parseNull = (data: unknown): ParseSuccess<null> | ParseFailure =>
  isNull(data) ? success(data) : failure('Not null')

export const parseBoolean = (
  data: unknown,
): ParseSuccess<boolean> | ParseFailure =>
  isBoolean(data) ? success(data) : failure('Not a boolean')

export const parseNumber = (
  data: unknown,
): ParseSuccess<number> | ParseFailure =>
  isNumber(data) ? success(data) : failure('Not a number')

export const parseString = (
  data: unknown,
): ParseSuccess<string> | ParseFailure =>
  isString(data) ? success(data) : failure('Not a string')

export const parseBigInt = (
  data: unknown,
): ParseSuccess<bigint> | ParseFailure =>
  isBigInt(data) ? success(data) : failure('Not a bigint')

export const parseSymbol = (
  data: unknown,
): ParseSuccess<symbol> | ParseFailure =>
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
) => {
  const v = V.literal(...constants)
  return (data: unknown): ParseSuccess<T[number]> | ParseFailure =>
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
      [K in keyof T]: RequiredParser<T[K]>
    }
  ) =>
  (data: unknown): ParseSuccess<T[number]> | ParseFailure => {
    for (const parser of parsers) {
      const result = parser(data)
      if (result.tag !== 'failure') {
        return success(result.value)
      }
    }
    return failure('No parser in the union matched')
  }

/**
 * Used to represent optional validators at runtime and compile-time in two different ways
 */
const optionalSymbol = Symbol('optional parser')

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param parser
 */
export const optional = <T>(parser: RequiredParser<T>): OptionalParser<T> =>
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a validator represents an optional value.
   */
  Object.assign(union(parseUndefined, parser), {
    [optionalSymbol]: true,
  }) as unknown as OptionalParser<T>

export const nullable = <T>(
  parser: RequiredParser<T>,
): RequiredParser<T | null> => union(parseNull, parser)

export const undefineable = <T>(
  parser: RequiredParser<T>,
): RequiredParser<T | undefined> => union(parseUndefined, parser)

/*
 * Product types
 */

// Helper to object
const wasPropParseSuccess = <T>(
  prop: [string, ParseResult<T>],
): prop is [string, Exclude<ParseResult<T>, { tag: 'failure' }>] =>
  prop[1].tag !== 'failure'

// Helper to object
const wasPropPresent = <T>(
  prop: [string, Exclude<ParseResult<T>, { tag: 'failure' }>],
): prop is [
  string,
  Exclude<ParseResult<T>, { tag: 'failure' | 'success-prop-absent' }>,
] => prop[1].tag !== 'success-prop-absent'

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
    // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalParser<T[K]>
      : RequiredParser<T[K]>
  }) =>
  (data: unknown): RequiredParseResult<T> => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const results = Object.keys(schema).map((key) => {
      const parser = schema[key]
      if (parser === undefined) {
        // TODO this shouldn't happen, as the type ensures that all properties are validators
        return [key, failure('No parser for the key')] as [string, ParseFailure]
      }
      if (!hasKey(data, key)) {
        // If the key is not present, the validator must represent an optional property
        return optionalSymbol in parser
          ? ([key, successOptional()] as [string, ParseSuccessPropAbsent])
          : ([key, failure('Key is missing')] as [string, ParseFailure])
      }
      const value = data[key]
      return [key, parser(value)] as [string, ParseResult<unknown>]
    })
    if (!results.every(wasPropParseSuccess)) {
      return failure('Not all properties are valid')
    }
    return success(
      // TODO if none of the successes were fallbacks, we can just return data as is, thus preserving equality
      Object.fromEntries(
        results
          .filter(wasPropPresent)
          .map(([key, result]) => [key, result.value]),
      ),
    ) as RequiredParseResult<T>
  }

/*
 * Recursive Types
 */

/**
 * Local helper function
 * @param results
 */
const areAllSuccesses = <T>(
  results: RequiredParseResult<T>[],
): results is (ParseSuccess<T> | ParseSuccessFallback<T>)[] =>
  results.every((result) => result.isSuccess)

/**
 * Validate arrays
 * @return a validator function that validates arrays
 * @param parseItem
 */
export const array =
  <T>(parseItem: RequiredParser<T>): RequiredParser<T[]> =>
  (data: unknown) => {
    if (!Array.isArray(data)) {
      return failure('Not an array')
    }
    const results: RequiredParseResult<T>[] = data.map(parseItem)
    if (!areAllSuccesses(results)) {
      return failure('Not all items in the array are valid')
    }
    // TODO if all were non-fallbacks, return the same array
    return success(results.map((result) => result.value))
  }
