import { Primitive } from '../common'
import { failure, ParseFailure, Parser, ParseSuccess, success } from './types'
import { equalsGuard } from '../guards'
import { stringify } from '../internals'

/**
 * Compares the input against a list of primitive values with the strict equality operator (`===`).
 * The inferred type of the parser is that of a literal type; for example, `equals('red')` returns a `Parser<'red'>`.
 * When called with multiple arguments, the parser will succeed if the input equals to any of the provided values,
 * and thus return a union type.
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
 * @example
 * If you pass in multiple values, the parser will validate a union type:
 *  ```ts
 * const parseLogLevel = equals('debug', 'info', 'warning', 'error')
 * parseLogLevel('info') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * parseLogLevel('error') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * ```
 * @example
 * When explicitly annotating unions, provide a tuple of the union members as type argument:
 *  ```ts
 * const parseLogLevel = equals<['debug', 'info', 'warning', 'error']>('debug', 'info', 'warning', 'error')
 * ```
 * If you want a type alias, do it as such:
 *  ```ts
 *  type LogLevelArray = ['debug', 'info', 'warning', 'error']
 *  type LogLevel = LogLevelArray[number]
 * const parseLogLevel = equals<LogLevelArray>('debug', 'info', 'warning', 'error')
 * ```
 * @param constants One or more primitive values that are compared against `data` with the `===` operator.
 * @returns A parser function that validates the input against the provided constants.
 */
export const equals = <const T extends [...Primitive[]]>(
  ...constants: T
): Parser<T[number]> => {
  const v = equalsGuard(...constants)
  return (data: unknown): ParseSuccess<T[number]> | ParseFailure =>
    v(data)
      ? success(data as T[number])
      : failure(`Does not equal to any value in ${stringify(constants)}`)
}
