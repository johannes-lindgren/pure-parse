import {
  failure,
  isSuccess,
  ParseSuccess,
  ParseSuccessFallback,
  RequiredParser,
  RequiredParseResult,
  success,
  successFallback,
} from './parse'

// Local helper function
const areAllSuccesses = <T>(
  results: RequiredParseResult<T>[],
): results is (ParseSuccess<T> | ParseSuccessFallback<T>)[] =>
  results.every((result) => isSuccess(result))

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
    let allOriginal = true
    for (const result of results) {
      allSuccess &&= result.tag !== 'failure'
      allOriginal &&= result.tag === 'success'
    }

    if (allOriginal) {
      // Preserve reference equality if no properties were falling back to defaults
      return success(data as T[])
    }
    if (!allSuccess) {
      return failure('Not all elements are valid')
    }

    // If any element is a fallback, return a new array
    return successFallback(
      (
        results as Array<Exclude<RequiredParseResult<T>, { tag: 'failure' }>>
      ).map((result) => result.value),
    )
  }
