import { isObject } from '../guard'
import {
  failure,
  OptionalParser,
  ParseSuccess,
  Parser,
  ParseResult,
  success,
} from './types'
import { optionalSymbol } from '../internals'

/**
 * Objects have a fixed set of properties that can have different types.
 * @example
 * const parseUser = object({
 *   id: parseNumber,
 *   active: parseBoolean,
 *   name: parseString,
 *   email: optional(parseString),
 * })
 * @param schema maps keys to validation functions.
 * @return a parser function that validates objects according to `schema`.
 */
export const object = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): Parser<T> => {
  const entries = Object.entries(schema)
  return (data) => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const dataOutput = {} as Record<string, unknown>
    for (let i = 0; i < entries.length; i++) {
      const [key, parser] = entries[i]!
      const value = (data as Record<string, unknown>)[key]
      // Perf: only check if the property exists the value is undefined => huge performance boost
      if (value === undefined && !data.hasOwnProperty(key)) {
        if (parser[optionalSymbol] === true) {
          // The key is optional, so we can skip it
          continue
        }
        return failure('A property is missing')
      }

      const parseResult = parser(value)
      if (parseResult.tag === 'failure') {
        return failure('Not all properties are valid')
      }
      dataOutput[key] = (parseResult as ParseSuccess<unknown>).value
    }

    return success(dataOutput) as ParseResult<T>
  }
}
