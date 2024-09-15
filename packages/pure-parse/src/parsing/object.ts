import { isObject } from '../validation'
import { hasKey } from '../internals'
import {
  failure,
  OptionalParser,
  ParseFailure,
  ParseResult,
  ParseSuccess,
  ParseSuccessFallback,
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

const analyze = <T>(
  results: Array<[string, ParseResult<T>]>,
):
  | {
      tag: 'all-original'
    }
  | {
      tag: 'some-unoriginal'
      results: Array<[string, Exclude<ParseResult<T>, { tag: 'failure' }>]>
    }
  | {
      tag: 'failure'
    } => {
  let allOriginal = true
  for (const [, result] of results) {
    if (result.tag === 'failure') {
      return { tag: 'failure' }
    }
    if (result.tag === 'success-fallback') {
      allOriginal = false
    }
  }
  return allOriginal
    ? { tag: 'all-original' }
    : {
        tag: 'some-unoriginal',
        results: results as Array<
          [string, Exclude<ParseResult<T>, { tag: 'failure' }>]
        >,
      }
}

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
    const parseResults = Object.keys(schema).map((key) => {
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
    const anlyticsResult = analyze(parseResults)
    if (anlyticsResult.tag === 'failure') {
      return failure('Not all properties are valid')
    }
    if (anlyticsResult.tag === 'all-original') {
      // Preserve reference equality if no properties were falling back to defaults
      return success(data as T)
    }
    return successFallback(
      Object.fromEntries(
        anlyticsResult.results
          .filter(wasPropPresent)
          .map(([key, result]) => [key, result.value]),
      ),
    ) as RequiredParseResult<T>
  }
