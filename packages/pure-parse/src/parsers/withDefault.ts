import { InfallibleParser, Parser } from './Parser'
import { oneOf } from './oneOf'
import { success } from './ParseResult'

/**
 * Provide a default value to fall back to when parsing fails.
 * Since the default value is static, the parser will always succeed.
 * @see {@link oneOf} for a more flexible alternative.
 * @example
 * Parse a number with a default value:
 * ```ts
 * const parseNum = withDefault(parseNumber, 0)
 * parseNum(1) // -> ParseSuccess<number>
 * parseNum(null) // -> ParseSuccess<0>
 * ```
 * @example
 * Parse an array of objects, but replace the objects with a default value if the parsing fails:
 * ```ts
 * const parseContent = array(
 *   withDefault(
 *     object({
 *       tag: equals('text'),
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
  oneOf(parser, () => success(fallbackValue)) as InfallibleParser<T | F>
