import * as V from '../guard'
import {
  isBigInt,
  isBoolean,
  isNull,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
} from '../guard'
import { failure, ParseFailure, Parser, ParseSuccess, success } from './types'
import { Primitive } from '../common'

// TODO rename to primitive?
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
  const v = V.literal(...constants)
  return (data: unknown): ParseSuccess<T[number]> | ParseFailure =>
    v(data)
      ? success(data as T[number])
      : failure(`Not a literal of: ${JSON.stringify(constants)}`)
}

/**
 * Parse `undefined`
 * @example
 * parseUndefined(undefined) // => ParseSuccess<undefined>
 * parseUndefined(null) // => ParseFailure
 * @param data data to be validated
 */
export const parseUndefined = (
  data: unknown,
): ParseSuccess<undefined> | ParseFailure =>
  isUndefined(data) ? success(data) : failure('Not undefined')

/**
 * Parse `null`
 * @example
 * parseNull(null) // => ParseSuccess<null>
 * @example
 * parseNull(undefined) // => ParseFailure
 * @param data data to be validated
 */
export const parseNull = (data: unknown): ParseSuccess<null> | ParseFailure =>
  isNull(data) ? success(data) : failure('Not null')

/**
 * Parse `boolean`
 * @example
 * parseBoolean(true) // => ParseSuccess<boolean>
 * @example
 * parseBoolean(false) // => ParseSuccess<boolean>
 * @example
 * parseBoolean(0) // => ParseFailure
 * @param data data to be validated
 */
export const parseBoolean = (
  data: unknown,
): ParseSuccess<boolean> | ParseFailure =>
  isBoolean(data) ? success(data) : failure('Not a boolean')

/**
 * Parse `number`
 * @example
 * parseNumber(0) // => ParseSuccess<number>
 * @example
 * parseNumber('0') // => ParseFailure
 * @param data data to be validated
 */
export const parseNumber = (
  data: unknown,
): ParseSuccess<number> | ParseFailure =>
  isNumber(data) ? success(data) : failure('Not a number')

/**
 * Parse `string`
 * @example
 * parseString('abc') // => ParseSuccess<string>
 * @example
 * parseString(0) // => ParseFailure
 * @param data data to be validated
 */
export const parseString = (
  data: unknown,
): ParseSuccess<string> | ParseFailure =>
  isString(data) ? success(data) : failure('Not a string')

/**
 * Parse `bigint`
 * @example
 * parseBigInt(0n) // => ParseSuccess<bigint>
 * @example
 * parseBigInt(0) // => ParseFailure
 * @param data data to be validated
 */
export const parseBigInt = (
  data: unknown,
): ParseSuccess<bigint> | ParseFailure =>
  isBigInt(data) ? success(data) : failure('Not a bigint')

/**
 * Parse `symbol`
 * @example
 * parseSymbol(Symbol('abc')) // => ParseSuccess<symbol>
 * @example
 * parseSymbol('abc') // => ParseFailure
 * @param data data to be validated
 */
export const parseSymbol = (
  data: unknown,
): ParseSuccess<symbol> | ParseFailure =>
  isSymbol(data) ? success(data) : failure('Not a symbol')

/**
 * Use to skip validation, as it returns `true` for any input.
 * @example
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
export const parseUnknown = (data: unknown): ParseSuccess<unknown> =>
  success(data)
