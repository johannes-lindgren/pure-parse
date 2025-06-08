import { JsonValue } from '../common'
import { chain, Parser } from './Parser'
import { parseString } from './primitives'
import { failure, ParseResult, success } from './ParseResult'

/**
 * Parses a JSON value from a JSON string.
 * @example
 * ```ts
 * parseJson('{"key": "value"}') // -> ParseSuccess<JsonValue>
 * parseJson('123') // -> ParseSuccess<JsonValue>
 * ```
 * The value must be a JSON-string:
 * ```ts
 * parseJson('not a json string') // -> ParseFailure
 * parseJson(123) // -> ParseFailure
 * parseJson(null) // -> ParseFailure
 * ```
 * @example
 * You can chain together `parseJson` with other parsers:
 * ```ts
 * const parseUserJson = chain(parseJson, parseUser)
 * parseUserJson('{"name": "John", "age": 30}') // -> ParseSuccess<{ name: string, age: number }>
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
