import { InfallibleParser, RequiredParser, successFallback } from './parse'

/**
 * Use to provide a default value when parsing fails.
 * @param parser
 * @param defaultValue
 */
export const fallback =
  <T, F>(parser: RequiredParser<T>, defaultValue: F): InfallibleParser<T | F> =>
  (data: unknown) => {
    const result = parser(data)
    switch (result.tag) {
      case 'failure':
        return successFallback(defaultValue)
      case 'success-fallback':
        return result
      // Success
      default:
        return result
    }
  }
