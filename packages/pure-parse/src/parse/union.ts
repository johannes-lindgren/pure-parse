import { optionalSymbol } from './optionalSymbol'
import {
  failure,
  OptionalParser,
  ParseFailure,
  ParseSuccess,
  Parser,
  success,
} from './parse'
import { parseNull, parseUndefined } from './primitives'

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
  ) =>
  (data: unknown): ParseSuccess<T[number]> | ParseFailure => {
    for (const parser of parsers) {
      const result = parser(data)
      if (result.tag === 'success') {
        return success(result.value)
      }
    }
    return failure('No parser in the union matched')
  }

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param parser
 */
export const optional = <T>(parser: Parser<T>): OptionalParser<T> =>
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a validator represents an optional value.
   */
  Object.assign(union(parseUndefined, parser), {
    [optionalSymbol]: true,
  }) as unknown as OptionalParser<T>

export const nullable = <T>(parser: Parser<T>): Parser<T | null> =>
  union(parseNull, parser)

export const undefineable = <T>(parser: Parser<T>): Parser<T | undefined> =>
  union(parseUndefined, parser)

export const optionalNullable = <T>(
  parser: Parser<T>,
): OptionalParser<T | null> => optional(nullable(parser))
