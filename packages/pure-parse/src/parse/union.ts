import { failure, Parser, success } from './types'

/**
 * Validate union types.
 * @example
 * const parseNumberOrString = union(parseNumber, parseString)
 * parseNumberOrString(0) // => ParseSuccess<number | string>
 * parseNumberOrString('abc') // => ParseSuccess<number | string>
 * parseNumberOrString(null) // => ParseError
 * @example
 * It's commonly used in discriminated unions:
 * ```ts
 * const parseResult = union(
 *   object({
 *     tag: literal('success')
 *     value: parseString
 *   }),
 *   object({
 *     tag: literal('error')
 *   }),
 * )
 * ```
 * @example
 * Annotating `union` with type arguments requires you to wrap the type in an array:
 *  ```ts
 *  type Success = {
 *    tag: 'success'
 *    value: string
 *  }
 *  type Failure = {
 *    tag: 'failure'
 *  }
 *  type Result = Success | Failure
 *  const parseLogLevel = literal<[Success, Failure]>(
 *   object({
 *     tag: literal('success')
 *     value: parseString
 *   }),
 *   object({
 *     tag: literal('error')
 *   }),
 * )
 * ```
 * @param parsers any of these parser functions must match the data.
 * @return A parser function that validates unions
 */
export const union =
  <T extends readonly [...unknown[]]>(
    ...parsers: {
      [K in keyof T]: Parser<T[K]>
    }
  ): Parser<T[number]> =>
  (data) => {
    for (const parser of parsers) {
      const result = parser(data)
      if (result.tag === 'success') {
        return success(result.value)
      }
    }
    return failure('No parser in the union matched')
  }
