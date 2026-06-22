import { Parser } from './Parser'
import { failure, ParseSuccess, propagateFailure, success } from './ParseResult'

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
 * @return a function that parses non-empty arrays
 * @param parseItem
 */
export const nonEmptyArray =
  <T>(parseItem: Parser<T>): Parser<[T, ...T[]]> =>
  (data) => {
    if (!Array.isArray(data)) {
      return failure('Expected array')
    }
    if (data.length === 0) {
      return failure('Expected non-empty array')
    }
    const result = array(parseItem)(data)
    if (result.tag === 'failure') {
      return result
    }
    return success(result.value as [T, ...T[]])
  }
