import {
  array,
  dictionary,
  isBoolean,
  isNull,
  isNumber,
  isString,
  union,
  Validator,
} from './validation.ts'

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
    dictionary(isJsonValue),
    array(isJsonValue),
  ])(data)

/**
 * This function will not throw an error.
 * @param is - a validation function
 */
export const parseJson =
  <T>(is?: Validator<T>) =>
  (
    text: string,
  ): undefined extends typeof is ? JsonValue | Error : T | Error => {
    try {
      // It's normally unsafe to cast the type like this, but in this instance, we know that JSON.parse asserts
      //  that the returned value is of our type `Json`. We save some computation time by skipping the validation with
      //  isJson
      const data = JSON.parse(text) as JsonValue
      if (!is) {
        return data
      }
      return is(data) ? data : new Error('Validation failed')
    } catch (e) {
      return e instanceof Error ? e : new Error(`Unknown error: ${e}`)
    }
  }
