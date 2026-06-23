import { Parser } from './Parser'
import {
  failure,
  ParseResult,
  ParseSuccess,
  propagateFailure,
  success,
} from './ParseResult'
import { isArray } from '../guards'

/**
 * Validate arrays
 * @return a function that parses arrays
 * @param parseItem
 */
export const array =
  <T>(parseItem: Parser<T>): Parser<T[]> =>
  (data) => {
    if (!Array.isArray(data)) {
      return failure('Expected array')
    }

    const dataOutput = []
    for (let i = 0; i < data.length; i++) {
      const parseResult = parseItem(data[i])
      if (parseResult.tag === 'failure') {
        return propagateFailure(parseResult, { tag: 'array', index: i })
      }
      dataOutput.push((parseResult as ParseSuccess<unknown>).value)
    }
    return success(dataOutput as T[])
  }

/**
 * Validate non-empty arrays
 * @example
 * ```ts
 * const parseNonEmptyNumberArray = parseNonEmptyArray(parseNumber)
 *
 * parseNonEmptyNumberArray([1,2,3]) // -> ParseSuccess<[number, ...number[]]>
 * parseNonEmptyNumberArray([1]) // -> ParseSuccess<[number, ...number[]]>
 *
 * parseNonEmptyNumberArray([]) // -> ParseFailure
 * parseNonEmptyNumberArray(['a']) // -> ParseFailure
 * parseNonEmptyNumberArray(1) // -> ParseFailure
 * ```
 * @return a function that parses non-empty arrays
 * @param parseItem
 */
export const nonEmptyArray = <T>(parseItem: Parser<T>): Parser<[T, ...T[]]> => {
  const parseTArray = array(parseItem)
  return (data) => {
    if (!isArray(data)) {
      return failure('Expected array')
    }
    if (data.length === 0) {
      return failure('Expected non-empty array')
    }
    return parseTArray(data) as ParseResult<[T, ...T[]]>
  }
}
