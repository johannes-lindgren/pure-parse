import {
  array,
  record,
  isBoolean,
  isNull,
  isNumber,
  isString,
  union,
  Validator,
} from './validation.ts'

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
  union([
    isNull,
    isBoolean,
    isNumber,
    isString,
    record(isJsonValue),
    array(isJsonValue),
  ])(data)

/**
 * This function will not throw an error.
 * @param is - a validation function
 */
export const parseJson =
  <T>(is: Validator<T>) =>
  (text: string): T | Error => {
    try {
      const data = JSON.parse(text)
      return is(data) ? data : new Error('Validation failed')
    } catch (e) {
      return e instanceof Error ? e : new Error(`Unknown error: ${e}`)
    }
  }
