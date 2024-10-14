// TODO rename to primitive?
import { Primitive } from '../common'
import { failure, ParseFailure, Parser, ParseSuccess, success } from './types'
import { literalGuard as literal1 } from '../guard'

/**
 * Parse a primitive value .
 * @example
 * const parseInfo = literal('info')
 * parseInfo('info') // => ParseSuccess<'info'>
 * @example
 * const parseInfo = literal('info')
 * parseInfo('error') // => ParseFailure
 * @example
 * If you pass in multiple values, the parser will validate a union type:
 *  ```ts
 * const parseLogLevel = literal('debug', 'info', 'warning', 'error')
 * parseLogLevel('info') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * parseLogLevel('error') // => ParseSuccess<'debug' | 'info' | 'warning' | 'error'>
 * ```
 * @example
 * Annotating `literal` requires you to wrap it in an array:
 *  ```ts
 * const parseLogLevel = literal<['debug', 'info', 'warning', 'error']>('debug', 'info', 'warning', 'error')
 * ```
 * If you want a type alias, do it like this:
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
