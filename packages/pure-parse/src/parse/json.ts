import { Guard } from '../guard'

/**
 * This function will not throw an error.
 * @param is - a validation function
 */
export const parseJson =
  <T>(is: Guard<T>) =>
  (text: string): T | Error => {
    try {
      const data = JSON.parse(text)
      return is(data) ? data : new Error('Validation failed')
    } catch (e) {
      return e instanceof Error ? e : new Error(`Unknown error: ${e}`)
    }
  }
