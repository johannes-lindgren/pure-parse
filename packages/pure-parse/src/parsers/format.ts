import { ParseFailure, Path } from './types'

/**
 * Formats a failure to a human-readable string.
 * @param failure
 */
export const formatFailure = (failure: ParseFailure): string =>
  failure.path.length === 0
    ? failure.error
    : `${failure.error} at ${formatPath(failure.path)}`

/**
 * Formats a failure `Path` to a JsonPath.
 * @param path
 */
export const formatPath = (path: Path[]): string =>
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
