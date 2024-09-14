import { isObject } from '../validation'
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
    const results = Object.keys(schema).map((key) => {
      const parser = schema[key]
      if (parser === undefined) {
        // TODO this shouldn't happen, as the type ensures that all properties are validators
        return [key, failure('No parser for the key')] as [string, ParseFailure]
      }
      if (!hasKey(data, key)) {
        // If the key is not present, the validator must represent an optional property
        return optionalSymbol in parser
          ? ([key, successOptional()] as [string, ParseSuccessPropAbsent])
          : ([key, failure('Key is missing')] as [string, ParseFailure])
      }
      const value = data[key]
      return [key, parser(value)] as [string, ParseResult<unknown>]
    })
    const { allSuccess, allOriginal } = results.reduce(
      (acc, [_, result]) => {
        acc.allSuccess &&= result.tag !== 'failure'
        acc.allOriginal &&= result.tag === 'success'
        return acc
      },
      {
        allSuccess: true,
        allOriginal: true,
      },
    )
    if (allOriginal) {
      // Preserve reference equality if no properties were falling back to defaults
      return success(data as T)
    }
    if (!allSuccess) {
      return failure('Not all properties are valid')
    }
    return successFallback(
      // TODO if none of the successes were fallbacks, we can just return data as is, thus preserving equality
      Object.fromEntries(
        results
          .filter(wasPropPresent)
          .map(([key, result]) => [key, result.value]),
      ),
    ) as RequiredParseResult<T>
  }
