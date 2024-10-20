import { failure, InfallibleParser, Parser, success } from './types'
import { union } from './union'

/**
 * Tries several different parsers in order. The first successful parsing attempt will be returned, or a failure if all parsing attempts fail.
 * @param parsers A list of parsers to be called in order.
 * @returns A parser that will call the parsers in `parsers` in order, and return the result of the first successful parsing attempt, or a failure if all parsing attempts fail.
 * @example
 * Parse a number from a data that should be a number or a stringified number:
 * ```ts
 * const parseStrOrNum = fallback([parseNumber, parseNumberFromString])
 * parseStrOrNum(2) // -> { tag: 'success', value: 2 }
 * parseStrOrNum('2') // -> { tag: 'success', value: 2 }
 * ```
 * @example
 * Parse rich text data from a data that should be either a string or a rich text object:
 * ```ts
 * const parseContent = oneOf([
 *   parseRichTextFromString,
 *   object({
 *    tag: literal('text'),
 *    value: parseString,
 *    marks: array(parseMark),
 *   })
 *  ])
 *  ```
 *  @example
 *  Provide a default value when parsing fails, (you may also use `fallbackValue` for this use case):
 *  ```ts
 *  const parseName = oneOf([
 *    parseString,
 *    () => success('Anonymous')
 *  ])
 *  ```
 */
export const oneOf = union

/**
 * Use to provide a static default value when parsing fails. Since the default value is static, the parser will always succeed.
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
export const withDefault =
  <T, F>(parser: Parser<T>, fallbackValue: F): InfallibleParser<T | F> =>
  (data: unknown) => {
    const result = parser(data)
    switch (result.tag) {
      case 'success':
        return result
      case 'failure':
        return success(fallbackValue)
    }
  }
