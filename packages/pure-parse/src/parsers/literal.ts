// TODO rename to primitive?
import { Primitive } from '../common'
import { failure, ParseFailure, Parser, ParseSuccess, success } from './types'
import { literalGuard as literal1 } from '../guards'

/**
 * Literals types represent single values of primitive types; for example, `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values.
 * @example
 * ```ts
 * const parseInfo = literal('info')
 * parseInfo('info') // => ParseSuccess<'info'>
 * ```
 * @example
 * ```ts
 * const parseInfo = literal('info')
 * parseInfo('error') // => ParseFailure
 * ```
 * @example
 * Commonly used in discriminated unions:
 * ```ts
 * const parseResult = oneOf([
 *  object({
 *    tag: literal('success')
 *  }),
 *  object({
 *    tag: literal('error')
 *   }),
 * ])
 * ```
 * @example
 * If you pass in multiple values, the parser will validate a union type:
 *  ```ts
 * const parseLogLevel = literal('debug', 'info', 'warning', 'error')
 * parseLogLevel('info') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * parseLogLevel('error') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * ```
 * @example
 * When explicitly annotating unions, provide a tuple of the union members as type argument:
 *  ```ts
 * const parseLogLevel = literal<['debug', 'info', 'warning', 'error']>('debug', 'info', 'warning', 'error')
 * ```
 * If you want a type alias, do it as such:
 *  ```ts
 *  type LogLevelArray = ['debug', 'info', 'warning', 'error']
 *  type LogLevel = LogLevelArray[number]
 * const parseLogLevel = literal<LogLevelArray>('debug', 'info', 'warning', 'error')
 * ```
 * @param constants One or more primitive values that are compared against `data` with the `===` operator.
 * @returns A parser function that validates the input against the provided constants.
 */
export const literal = <const T extends readonly [...Primitive[]]>(
  ...constants: T
): Parser<T[number]> => {
  const v = literal1(...constants)
  return (data: unknown): ParseSuccess<T[number]> | ParseFailure =>
    v(data)
      ? success(data as T[number])
      : failure(`Not a literal of: ${JSON.stringify(constants)}`)
}
