import { ParseFailure, Parser, ParseSuccess, success } from './types'
import { oneOf } from './oneOf'

/**
 * A parser that always succeeds
 */
export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>

/**
 * A parser that always fails
 */
export type UnsuccessfulParser = (data: unknown) => ParseFailure

/**
 * Provide a default value to fall back to when parsing fails.
 * This is a shorthand expression for {@link oneOf} combined with {@link succeedWith}.
 * Since the default value is static, the parser will always succeed.
 * @see {@link oneOf} for a more flexible alternative.
 * @example
 * Parse an array of objects, where if an object is of an unknown type, it gets replaced with a default value.
 * ```ts
 * const parseContent = array(
 *   withDefault(
 *     object({
 *       tag: literal('text'),
 *       value: parseString,
 *     }),
 *     {
 *       tag: 'unknown',
 *     },
 *   ),
 * )
 *
 * const res = parseContent([{
 *   tag: 'text',
 *   value: 'hello'
 * }, {
 *   tag: 'number'
 *   value: 123
 * }])
 * ```
 * where res becomes:
 * ```ts
 * [
 *   { tag: 'text', value: 'hello'},
 *   { tag: 'unknown' }
 * ]
 * ```
 * @example
 * Calling `withDefault` is _almost_ the same as:
 * ```ts
 * oneOf(parser, () => success(fallbackValue))
 * ```
 * The only difference is that the return type of the parser will always be a success.
 * @param parser
 * @param fallbackValue
 */
export const withDefault = <T, F>(
  parser: Parser<T>,
  fallbackValue: F,
): InfallibleParser<T | F> =>
  oneOf(parser, succeedWith(fallbackValue)) as InfallibleParser<T | F>

/**
 * Returns a parser that always succeeds with `value`. Use with `oneOf` to provide defaults.
 * @see {@link failWith} for a counterpart
 * @example
 * Provide defaults:
 * ```ts
 * const parseNum = oneOf(parseNumber, succeedWith(0))
 * parseNum(1) // -> ParseSuccess<number>
 * parseNum(null) // -> ParseSuccess<0>
 * ```
 * @param value
 * @return a parser that always succeeds with `value`.
 */
export const succeedWith =
  <const T>(value: T): InfallibleParser<T> =>
  () =>
    success(value)

/**
 * A parser that always succeeds.
 * Parsing `unknown` always succeeds because all values can be assigned to `unknown`—`unknown` corresponds to the set of all values.
 * @see {@link parseNever} for a counterpart
 * @example
 * Use to skip validation, as it results in a success for any input.
 * ```ts
 * const parseResponse = object({
 *   status: parseNumber,
 *   data: unknown,
 * })
 * parseResponse({
 *   status: 200,
 *   data: { id: 123, name: 'John' }
 * }) // => ParseSuccess<{ status: number, data: unknown }>
 * ```
 * @param data data to be validated
 */
export const parseUnknown: InfallibleParser<unknown> = (data) => success(data)
