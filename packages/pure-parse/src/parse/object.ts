import { isObject } from '../validate'
import { hasKey } from '../internals'
import {
  failure,
  OptionalParser,
  ParseFailure,
  ParseResult,
  ParseSuccessPropAbsent,
  RequiredParser,
  RequiredParseResult,
  success,
  successFallback,
  successOptional,
} from './parse'
import { optionalSymbol } from './optionalSymbol'

// Local helper function
const wasPropPresent = <T>(
  prop: [string, Exclude<ParseResult<T>, { tag: 'failure' }>],
): prop is [
  string,
  Exclude<ParseResult<T>, { tag: 'failure' | 'success-prop-absent' }>,
] => prop[1].tag !== 'success-prop-absent'

/**
 * Validate structs; records that map known keys to a specific type.
 *
 * ```ts
 * const parseUser = object({
 *   id: parseNumber,
 *   uid: parseString,
 *   active: parseBoolean,
 *   name: optional(parseString),
 * })
 * ```
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, unknown>>(schema: {
    // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalParser<T[K]>
      : RequiredParser<T[K]>
  }) =>
  (data: unknown): RequiredParseResult<T> => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const schemaKeys = Object.keys(schema)
    const results = []
    let allOriginal = true
    let key
    for (key in schema) {
      const parser = schema[key]
      if (!hasKey(data, key)) {
        if (optionalSymbol in parser) {
          results.push([key, successOptional()] as [
            string,
            ParseSuccessPropAbsent,
          ])
        } else {
          return failure('Not all properties are valid')
        }
        continue
      }
      const value = data[key]
      const result = parser(value)
      if (result.tag === 'failure') {
        return failure('Not all properties are valid')
      }
      if (result.tag === 'success-fallback') {
        allOriginal = false
      }
      results.push([key, result] as [string, ParseResult<unknown>])
    }

    if (allOriginal && results.length === Object.keys(data).length) {
      // Preserve reference equality if no properties were falling back to defaults.
      //  If true, this is a huge performance boost.
      return success(data as T)
    }

    return successFallback(
      Object.fromEntries(
        (
          results as Array<
            [string, Exclude<ParseResult<T>, { tag: 'failure' }>]
          >
        )
          .filter(wasPropPresent)
          .map(([key, result]) => [key, result.value]),
      ),
    ) as RequiredParseResult<T>
  }
