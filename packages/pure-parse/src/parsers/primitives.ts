import {
  isBigInt,
  isBoolean,
  isNull,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
} from '../guards'
import { failure, ParseFailure, ParseSuccess, success } from './ParseResult'

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
  isUndefined(data) ? success(data) : failure('Expected undefined')

/**
 * Parse `null`
 * @example
 * parseNull(null) // => ParseSuccess<null>
 * @example
 * parseNull(undefined) // => ParseFailure
 * @param data data to be validated
 */
export const parseNull = (data: unknown): ParseSuccess<null> | ParseFailure =>
  isNull(data) ? success(data) : failure('Expected null')

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
  isBoolean(data) ? success(data) : failure('Expected type boolean')

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
  isNumber(data) ? success(data) : failure('Expected type number')

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
  isString(data) ? success(data) : failure('Expected type string')

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
  isBigInt(data) ? success(data) : failure('Expected type bigint')

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
  isSymbol(data) ? success(data) : failure('Expected type symbol')
