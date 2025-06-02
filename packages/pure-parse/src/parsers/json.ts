import { JsonValue } from '../common'
import { Parser } from './Parser'
import { parseString } from './primitives'
import { failure, ParseResult, success } from './ParseResult'

/**
 * Parses a JSON value from a JSON string.
 * @example
 *
 * ```ts
 * parseJson('{"key": "value"}') // -> ParseSuccess<{ key: string }>
 * parseJson('123') // -> ParseSuccess<number>
 * parseJson('invalid json string') // -> ParseFailure
 * ```
 * The value must be a JSON-string:
 * ```ts
 * parseJson(123) // -> ParseFailure
 * parseJson(null) // -> ParseFailure
 * ```
 * @param data
 */
export const parseJson: Parser<JsonValue> = (data): ParseResult<JsonValue> => {
  const strRes = parseString(data)
  if (strRes.error) {
    return strRes
  }

  try {
    return success(JSON.parse(strRes.value) as unknown as JsonValue)
  } catch {
    return failure('Expected a JSON string')
  }
}

/**
 * Parses a JSON value from a JSON string and passes it to the given parser `parser`.
 * @example
 * ```ts
 * const parseUser = object({
 *  name: parseString,
 *  age: parseNumber,
 * })
 *
 * json(parseUser)('{"name": "John", "age": 30}') // -> ParseSuccess<{ name: string, age: number }>
 * @param parser
 */
export const json =
  <T>(parser: Parser<T>): Parser<T> =>
  (data) => {
    const jsonRes = parseJson(data)
    if (jsonRes.error) {
      return jsonRes
    }
    return parser(jsonRes.value)
  }
