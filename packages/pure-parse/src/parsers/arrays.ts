import {
  failure,
  isSuccess,
  ParseSuccess,
  Parser,
  ParseResult,
  success,
} from './types'

// Local helper function
const areAllSuccesses = <T>(
  results: ParseResult<T>[],
): results is ParseSuccess<T>[] => results.every((result) => isSuccess(result))

/**
 * Validate arrays
 * @return a function that parses arrays
 * @param parseItem
 */
export const array =
  <T>(parseItem: Parser<T>): Parser<T[]> =>
  (data: unknown) => {
    if (!Array.isArray(data)) {
      return failure('Not an array')
    }
    const results: ParseResult<T>[] = data.map(parseItem)

    // Imperative programming for performance
    let allSuccess = true
    for (const result of results) {
      allSuccess &&= result.tag !== 'failure'
    }

    if (!allSuccess) {
      return failure('Not all elements are valid')
    }

    // If any element is a fallbackValue, return a new array
    return success(
      (results as Array<Exclude<ParseResult<T>, { tag: 'failure' }>>).map(
        (result) => result.value,
      ),
    )
  }
