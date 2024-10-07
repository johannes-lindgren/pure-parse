import { isObject } from '../guard'
import {
  failure,
  OptionalParser,
  ParseSuccess,
  Parser,
  ParseResult,
  success,
} from './parse'
import { optionalSymbol } from './optionalSymbol'

/**
 * Validate structs; records that map known keys to a specific type.
 * @example
 * const parseUser = object({
 *   id: parseNumber,
 *   uid: parseString,
 *   active: parseBoolean,
 *   name: optional(parseString),
 * })
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, unknown>>(schema: {
    // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalParser<T[K]>
      : Parser<T[K]>
  }) =>
  (data: unknown): ParseResult<T> => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const dataOutput = {} as Record<string, unknown>
    for (const key in schema) {
      const parser = schema[key]
      const value = (data as Record<string, unknown>)[key]
      // Perf: only check if the property exists the value is undefined => huge performance boost
      if (value === undefined && !data.hasOwnProperty(key)) {
        if (optionalSymbol in parser) {
          // The key is optional, so we can skip it
          continue
        }
        return failure('Not all properties are valid')
      }

      const parseResult = parser(value)
      if (parseResult.tag === 'failure') {
        return failure('Not all properties are valid')
      }
      dataOutput[key] = (parseResult as ParseSuccess<unknown>).value
    }

    return success(dataOutput) as ParseResult<T>
  }
