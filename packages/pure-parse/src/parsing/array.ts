import {
  failure,
  isSuccess,
  ParseSuccess,
  ParseSuccessFallback,
  RequiredParser,
  RequiredParseResult,
  success,
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
    if (!areAllSuccesses(results)) {
      return failure('Not all items in the array are valid')
    }
    // TODO if all were non-fallbacks, return the same array
    return success(results.map((result) => result.value))
  }
