import { arrayGuard, partialRecord } from './validation'
import { isBoolean, isNull, isNumber, isString } from './primitives'
import { JsonValue } from '../common'
import { union } from './union'

export const isJsonValue = (data: unknown): data is JsonValue =>
  union(
    isNull,
    isBoolean,
    isNumber,
    isString,
    partialRecord(isString, isJsonValue),
    arrayGuard(isJsonValue),
  )(data)
