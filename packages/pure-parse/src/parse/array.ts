import {
  failure,
  isSuccess,
  ParseSuccess,
  RequiredParser,
  RequiredParseResult,
  success,
} from './parse'

// Local helper function
const areAllSuccesses = <T>(
  results: RequiredParseResult<T>[],
): results is ParseSuccess<T>[] => results.every((result) => isSuccess(result))

/**
 * Validate arrays
 * @return a validator function that validates arrays
 * @param parseItem
 */
export const array =
  <T>(parseItem: RequiredParser<T>): RequiredParser<T[]> =>
  (data: unknown) => {
    if (!Array.isArray(data)) {
      return failure('Not an array')
    }
    const results: RequiredParseResult<T>[] = data.map(parseItem)

    // Imperative programming for performance
    let allSuccess = true
    for (const result of results) {
      allSuccess &&= result.tag !== 'failure'
    }

    if (!allSuccess) {
      return failure('Not all elements are valid')
    }

    // If any element is a fallback, return a new array
    return success(
      (
        results as Array<Exclude<RequiredParseResult<T>, { tag: 'failure' }>>
      ).map((result) => result.value),
    )
  }
