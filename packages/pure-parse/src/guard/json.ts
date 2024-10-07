import { array, partialRecord, union, Guard } from './validation'
import { isBoolean, isNull, isNumber, isString } from './guards'

/**
 * A value that represent any JSON-serializable data
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | { [x: string]: JsonValue }
  | JsonValue[]

export const isJsonValue = (data: unknown): data is JsonValue =>
  union(
    isNull,
    isBoolean,
    isNumber,
    isString,
    partialRecord(isString, isJsonValue),
    array(isJsonValue),
  )(data)

/**
 * This function will not throw an error.
 * @param is - a validation function
 */
export const parseJson =
  <T>(is: Guard<T>) =>
  (text: string): T | Error => {
    try {
      const data = JSON.parse(text)
      return is(data) ? data : new Error('Validation failed')
    } catch (e) {
      return e instanceof Error ? e : new Error(`Unknown error: ${e}`)
    }
  }
