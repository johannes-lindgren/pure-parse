import { Primitive } from '../common'

/**
 * Fail-safe serializer for any value into a string.
 * @param values
 */
export const stringify = (values: Primitive | Primitive[]): string => {
  if (Array.isArray(values)) {
    return `[${values.map(stringify).join(', ')}]`
  }
  switch (typeof values) {
    case 'bigint':
      return `${String(values)}n`
    case 'symbol':
      return values.toString()
    default:
      return JSON.stringify(values)
  }
}
