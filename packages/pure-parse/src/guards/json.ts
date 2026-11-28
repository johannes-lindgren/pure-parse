import { Guard } from './Guard'
import { JsonValue } from '../common'

/**
 * Checks if the given data is a valid JSON value.
 * Only plain JSON values are allowed. For example, `Date`, `Map`, `Set`, and custom class instances are not valid JSON values.
 * @param data
 */
export const isJsonValue: Guard<JsonValue> = (data): data is JsonValue => {
  // Iterative, so that the depth of the data is not limited by the call stack
  const stack: { value: unknown; leave: boolean }[] = [
    { value: data, leave: false },
  ]
  const ancestors = new Set<object>()
  while (stack.length > 0) {
    const { value, leave } = stack.pop()!
    if (leave) {
      ancestors.delete(value as object)
      continue
    }
    if (
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      continue
    }
    if (typeof value !== 'object') {
      return false
    }
    const isArray = Array.isArray(value)
    if (!isArray && Object.getPrototypeOf(value) !== Object.prototype) {
      return false
    }
    if (ancestors.has(value)) {
      // Circular reference
      return false
    }
    ancestors.add(value)
    stack.push({ value, leave: true })
    ;(isArray ? value : Object.values(value)).forEach((child: unknown) => {
      stack.push({ value: child, leave: false })
    })
  }
  return true
}
