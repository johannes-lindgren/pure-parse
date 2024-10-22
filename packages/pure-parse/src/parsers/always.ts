import { InfallibleParser, Parser, success } from './types'
import { oneOf } from './oneOf'

/**
 * Use to provide a static default value when parsing fails. Since the default value is static, the parser will always succeed.
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
 *       tag: 'unknown'
 *     }
 *   )
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
 * oneOf([parser], () => success(fallbackValue))
 * ```
 * The only difference is that the return type of the parser will always be a success.
 * @param parser
 * @param fallbackValue
 */
export const withDefault = <T, F>(
  parser: Parser<T>,
  fallbackValue: F,
): InfallibleParser<T | F> =>
  oneOf(parser, always(fallbackValue)) as InfallibleParser<T | F>

/**
 * Returns a parser that always succeeds with `value`. Use with `oneOf` to provide defaults.
 * @example
 * Provide defaults:
 * ```ts
 * const parseNum = oneOf(parseNumber, always(0))
 * parseNum(1) // -> ParseSuccess<number>
 * parseNum(null) // -> ParseSuccess<0>
 * ```
 * @param value
 */
export const always =
  <const T>(value: T): InfallibleParser<T> =>
  () =>
    success(value)
