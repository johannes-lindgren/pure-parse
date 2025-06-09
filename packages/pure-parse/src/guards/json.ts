import { Guard } from './Guard'
import { JsonValue } from '../common'

/**
 * Checks if the given data is a valid JSON value.
 * Only plain JSON values are allowed. For example, `Date`, `Map`, `Set`, and custom class instances are not valid JSON values.
 * @param data
 */
export const isJsonValue: Guard<JsonValue> = (data): data is JsonValue => {
  if (data === null) {
    return true
  }
  if (typeof data === 'boolean') {
    return true
  }
  if (typeof data === 'number') {
    return true
  }
  if (typeof data === 'string') {
    return true
  }
  if (Array.isArray(data)) {
    return data.every(isJsonValue)
  }
  if (typeof data === 'object') {
    if (Object.getPrototypeOf(data) !== Object.prototype) {
      return false
    }
    return Object.entries(data).every(isJsonValue)
  }
  return false
}
