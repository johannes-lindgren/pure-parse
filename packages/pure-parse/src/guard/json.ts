import { arrayGuard, partialRecord, union } from './validation'
import { isBoolean, isNull, isNumber, isString } from './primitives'
import { JsonValue } from '../common'

export const isJsonValue = (data: unknown): data is JsonValue =>
  union(
    isNull,
    isBoolean,
    isNumber,
    isString,
    partialRecord(isString, isJsonValue),
    arrayGuard(isJsonValue),
  )(data)
