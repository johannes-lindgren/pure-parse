import { isBoolean, isNull, isNumber, isString } from './primitives'
import { JsonValue } from '../common'
import { union } from './union'
import { partialRecord } from './records'
import { arrayGuard } from './arrays'

export const isJsonValue = (data: unknown): data is JsonValue =>
  union(
    isNull,
    isBoolean,
    isNumber,
    isString,
    partialRecord(isString, isJsonValue),
    arrayGuard(isJsonValue),
  )(data)
