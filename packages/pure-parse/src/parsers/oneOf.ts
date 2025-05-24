import { failure, Parser, success } from './types'

/**
 * Executes `parsers` in order and returns the first successful parsing attempt, or a failure if all fail.
 * Use it to parse unions, to parse data that comes in different shape, and to provide fallbacks for failed parsing attempts.
 * @see {@link withDefault} for a shorthand for fallback with a static value.
 * @example
 * Parse unions:
 * ```ts
 * const parseNumberOrString = oneOf(parseNumber, parseString)
 * parseNumberOrString(0) // => ParseSuccess<number | string>
 * parseNumberOrString('abc') // => ParseSuccess<number | string>
 * parseNumberOrString(null) // => ParseError
 * ```
 * @example
 * Parse discriminated unions:
 * ```ts
 * const parseResult = oneOf(
 *   object({
 *     tag: equals('success')
 *     value: parseString
 *   }),
 *   object({
 *     tag: equals('error')
 *   }),
 * )
 * ```
 * @example
 * Provide fallbacks for failed parsing attempts; for example, parse a number from data that is either a number or a stringified number:
 * ```ts
 * const parseStrOrNum = fallback([parseNumber, parseNumberFromString])
 * parseStrOrNum(2) // -> { tag: 'success', value: 2 }
 * parseStrOrNum('2') // -> { tag: 'success', value: 2 }
 * ```
 * (Do not encode data like this when there's a choice; but sometimes, existing data comes in weird shapes and forms.)
 * @example
 * Provide a static default value when parsing fails:
 * ```ts
 * const parseName = oneOf([
 *   parseString,
 *   () => success('Anonymous')
 * ])
 * ```
 * You can also use {@link withDefault} for this use case.
 * @example
 * When explicitly annotating `oneOf`, provide a tuple as type argument:
 *  ```ts
 *  type Success = {
 *    tag: 'success'
 *    value: string
 *  }
 *  type Failure = {
 *    tag: 'failure'
 *  }
 *  type Result = Success | Failure
 *  const parseLogLevel = equals<[Success, Failure]>(
 *   object({
 *     tag: equals('success')
 *     value: parseString
 *   }),
 *   object({
 *     tag: equals('error')
 *   }),
 * )
 * ```
 * Due to a limitation of TypeScript, it is not possible to write `oneOf<string | number>()`. Therefore, it is generally recommended to omit the type arguments for oneOf and let TypeScript infer them.
 * @param parsers A list of parsers to be called in order.
 * @return A parser function that will call the parsers in `parsers` in order and return the result of the first successful parsing attempt, or a failure if all parsing attempts fail.
 */
export const oneOf =
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
    return failure('The value is not in the union')
  }
