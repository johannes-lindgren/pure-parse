import {
  failure,
  isSuccess,
  ParseSuccess,
  Parser,
  ParseResult,
  success,
  propagateFailure,
} from './types'

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
