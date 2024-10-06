import { InfallibleParser, RequiredParser, success } from './parse'

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
        return success(defaultValue)
      // Success
      default:
        return result
    }
  }
