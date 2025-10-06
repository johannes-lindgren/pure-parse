import { OmitProperty } from '../internals'
import {
  failure,
  isFailure,
  isSuccess,
  ParseFailure,
  ParseResult,
  ParseSuccess,
  success,
} from './ParseResult'
import { Guard } from '../guards'
import { formatResult } from './formatting'

export type Parser<T> = (data: unknown) => ParseResult<T>

/**
 * Special parser to check optional values
 */
export type OptionalParser<T> = (
  data: unknown,
) => ParseResult<T | undefined | OmitProperty>

/**
 * A parser that does not represent an optional property.
 */
export type RequiredParser<T> = (
  data: unknown,
) => ParseResult<Exclude<T, OmitProperty>>

/**
 * A parser that always succeeds
 */
export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>
/**
 * A parser that always fails
 */
export type UnsuccessfulParser = (data: unknown) => ParseFailure

/**
 * *****************************
 * Parser Combinators
 * *****************************
 */

/**
 * Transform the values of successful results.
 * @example
 * Transform strings to uppercase
 * ```ts
 * const parseToUpperCase = map(parseString, (str) => str.toUpperCase())
 * parseToUpperCase('hello') // -> ParseSuccess<'HELLO'>
 * parseToUpperCase(123) // -> ParseFailure
 * ```
 * @param parser
 * @param mapSuccess
 */
export const map =
  <A, B>(parser: Parser<A>, mapSuccess: (value: A) => B): Parser<B> =>
  (value) => {
    const result = parser(value)
    return isSuccess(result) ? success(mapSuccess(result.value)) : result
  }

/**
 * Transform successful results into either success or failure.
 * This is useful for chaining parsers.
 * @example
 * After parsing an array of numbers, ensure it is non-empty:
 * ```
 * const parseNonEmptyArray = chain(array(parseNumber), (value) =>
 *           value.length > 0
 *             ? success(value)
 *             : failure('Expected non-empty array'),
 *         )
 * ```
 * @param parser
 * @param parseSuccess
 */
export const chain =
  <A, B>(
    parser: Parser<A>,
    parseSuccess: (value: A) => ParseResult<B>,
  ): Parser<B> =>
  (value) => {
    const result = parser(value)
    return isSuccess(result) ? parseSuccess(result.value) : result
  }

/**
 * Transform failed results into either success or failure.
 * This is useful for error handling.
 * @example
 * Fall back to a default value if parsing fails:
 * ```
 * const parseCount = recover(
 *   parseNumber,
 *   () => 0
 * )
 * ```
 * @param parser
 * @param parseFailure
 */
export const recover =
  <A>(
    parser: Parser<A>,
    parseFailure: (error: ParseFailure['error']) => ParseResult<A>,
  ): Parser<A> =>
  (value) => {
    const result = parser(value)
    return isFailure(result) ? parseFailure(result.error) : result
  }

/**
 * Construct a parser from a type guard.
 * Tip: construct parsers from scratch for better error messages, and generally more flexibility.
 * @example
 * ```ts
 * const isUser = objectGuard({
 *   id: isNumber,
 *   name: isString,
 * })
 * const parseUser = parserFromGuard(isUser)
 * ```
 * @param guard
 */
export const parserFromGuard =
  <T>(guard: Guard<T>): Parser<T> =>
  (data: unknown) =>
    guard(data)
      ? success(data)
      : failure(`The data does not match the type guard`)
