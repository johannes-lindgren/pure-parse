import { ParseFailure, PathSegment } from './types'

/**
 * Formats a failure to a human-readable string.
 * @example
 * ```ts
 * const res = parseUser({ name: 123 })
 * if(isFailure(res){
 *   console.log(formatFailure(res))
 *   // "Expected string at $.name"
 * }
 * ```
 * @param failure
 */
export const formatFailure = (failure: ParseFailure): string =>
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
