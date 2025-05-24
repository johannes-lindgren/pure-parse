import { Primitive } from '../common'
import { Parser } from './Parser'
import { failure, ParseFailure, ParseSuccess, success } from './ParseResult'
import { stringify } from '../internals'

/**
 * Compares the input against a primitive values with the strict equality operator (`===`).
 * The inferred type of the parser is that of a literal type; for example, `equals('red')` returns a `Parser<'red'>`.
 * @example
 * ```ts
 * const parseInfo = equals('info')
 * parseInfo('info') // => ParseSuccess<'info'>
 * parseInfo('error') // => ParseFailure
 *
 * const parseOne = equals(1)
 * parseOne(1) // => ParseSuccess<1>
 * parseOne(2) // => ParseFailure
 * ```
 * @example
 * Commonly used in discriminated unions:
 * ```ts
 * const parseResult = oneOf([
 *  object({
 *    tag: equals('success')
 *  }),
 *  object({
 *    tag: equals('error')
 *   }),
 * ])
 * ```
 * @param constant One or more primitive values that are compared against `data` with the `===` operator.
 * @returns A parser function that validates the input against the provided constants.
 */
export const equals =
  <const T extends Primitive>(constant: T): Parser<T> =>
  (data: unknown): ParseSuccess<T> | ParseFailure =>
    data === constant
      ? success(data as T)
      : failure(`Does not equal to the value in ${stringify(constant)}`)
