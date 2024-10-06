/**
 * Returns true for any input. Use to skip validation.
 * @param data
 */
export const isUnknown = (data: unknown): data is unknown => true

export const isNull = (data: unknown): data is null => data === null

export const isUndefined = (data: unknown): data is undefined =>
  typeof data === 'undefined'

export const isBoolean = (data: unknown): data is boolean =>
  typeof data === 'boolean'

export const isNumber = (data: unknown): data is number =>
  typeof data === 'number'

export const isString = (data: unknown): data is string =>
  typeof data === 'string'

export const isBigInt = (data: unknown): data is bigint =>
  typeof data === 'bigint'

export const isSymbol = (data: unknown): data is symbol =>
  typeof data === 'symbol'

export const isObject = (data: unknown): data is object =>
  typeof data === 'object' && data !== null

export const isArray: (data: unknown) => data is unknown[] = Array.isArray

export const isFunction = (data: unknown): data is Function =>
  typeof data === 'function'
