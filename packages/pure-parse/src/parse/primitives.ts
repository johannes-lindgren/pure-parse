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
import { failure, ParseFailure, ParseSuccess, success } from './types'
import { Primitive } from '../common'

/**
 *
 * @param constants One or more primitive values that are compared against `data` with the `===` operator.
 */
export const literal = <const T extends readonly [...Primitive[]]>(
  ...constants: T
) => {
  const v = V.literal(...constants)
  return (data: unknown): ParseSuccess<T[number]> | ParseFailure =>
    v(data)
      ? success(data as T[number])
      : failure(`Not a literal of: ${JSON.stringify(constants)}`)
}

export const parseUndefined = (
  data: unknown,
): ParseSuccess<undefined> | ParseFailure =>
  isUndefined(data) ? success(data) : failure('Not undefined')

export const parseNull = (data: unknown): ParseSuccess<null> | ParseFailure =>
  isNull(data) ? success(data) : failure('Not null')

export const parseBoolean = (
  data: unknown,
): ParseSuccess<boolean> | ParseFailure =>
  isBoolean(data) ? success(data) : failure('Not a boolean')

export const parseNumber = (
  data: unknown,
): ParseSuccess<number> | ParseFailure =>
  isNumber(data) ? success(data) : failure('Not a number')

export const parseString = (
  data: unknown,
): ParseSuccess<string> | ParseFailure =>
  isString(data) ? success(data) : failure('Not a string')

export const parseBigInt = (
  data: unknown,
): ParseSuccess<bigint> | ParseFailure =>
  isBigInt(data) ? success(data) : failure('Not a bigint')

export const parseSymbol = (
  data: unknown,
): ParseSuccess<symbol> | ParseFailure =>
  isSymbol(data) ? success(data) : failure('Not a symbol')
