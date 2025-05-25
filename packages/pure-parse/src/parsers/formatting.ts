import { ParseFailure, ParseResult, PathSegment } from './ParseResult'
import { isUndefined } from '../guards'

/**
 * Formats a failure to a human-readable string.
 * This is useful for debugging and logging parse results.
 * It formats both successful and unsuccessful parse results.
 * - Successful results are formatted as `ParseSuccess: <value>`, where `<value>` comes from `Object.prototype.toString()`. To customize the output, you can pass a `toString` function that converts the value to a string.
 * - Failures include the error message and the path where the failure occurred.
 * @example
 * Format an unsuccessful parse result:
 * ```ts
 * const parseUser = object({ name: parseString })
 * const res = parseUser({ name: 123 })
 * console.log(formatResult(res)) // -> "ParseFailure: Expected type string at $.name"
 * ```
 * @example
 * Format a successful parse result:
 * ```ts
 * const parseUser = object({ name: parseString })
 * const res = parseUser({ name: 'Alice' })
 * console.log(formatResult(res, JSON.stringify)) // -> "ParseSuccess: {"name":"Alice"}"
 * ```
 * @param result The result of a parse operation.
 * @param formatValue Optional function to convert the value to a string. If not provided, it uses string interpolation.
 */
export const formatResult = <T>(
  result: ParseResult<T>,
  formatValue?: (value: T) => string,
): string => {
  if (result.tag === 'success') {
    if (!isUndefined(formatValue)) {
      return `ParseSuccess: ${formatValue(result.value)}`
    }
    try {
      return `ParseSuccess: ${result.value}`
    } catch {
      return `ParseSuccess: <unserializable>`
    }
  } else {
    return `ParseFailure: ${formatFailure(result)}`
  }
}

const formatFailure = (failure: ParseFailure): string =>
  failure.path.length === 0
    ? failure.error
    : `${failure.error} at ${formatPath(failure.path)}`

/**
 * Formats a failure `Path` to a JsonPath.
 * @example
 * ```ts
 * const path = [{ tag: 'object', key: 'name' }]
 * console.log(formatPath(path))
 * // "$.name"
 * ```
 * @param path
 */
export const formatPath = (path: PathSegment[]): string =>
  '$' +
  path
    .map((segment) => {
      switch (segment.tag) {
        case 'object':
          return `.${segment.key}`
        case 'array':
          return `[${segment.index}]`
      }
    })
    .join('')
