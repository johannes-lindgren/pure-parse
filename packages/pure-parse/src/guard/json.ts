import { isBoolean, isNull, isNumber, isString } from './primitives'
import { JsonValue } from '../common'
import { unionGuard } from './union'
import { partialRecordGuard } from './records'
import { arrayGuard } from './arrays'

export const isJsonValue = (data: unknown): data is JsonValue =>
  unionGuard(
    isNull,
    isBoolean,
    isNumber,
    isString,
    partialRecordGuard(isString, isJsonValue),
    arrayGuard(isJsonValue),
  )(data)
