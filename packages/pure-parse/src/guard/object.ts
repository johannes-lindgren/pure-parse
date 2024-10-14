import { Guard, OptionalGuard } from './types'
import { OptionalKeys, optionalSymbol, RequiredKeys } from '../internals'

/**
 * Same as {@link objectGuard}, but does not perform just-in-time (JIT) compilation with the `Function` constructor. This function is needed as a replacement in environments where `new Function()` is disallowed; for example, when the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) policy is set without the `'unsafe-eval`' directive.
 */
export const objectGuardNoJit =
  <T extends Record<string, unknown>>(schema: {
    [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
  }) =>
  (
    data: unknown,
  ): data is Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>> =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every((key) => {
      const guard = schema[key]!
      const value = (data as Record<string, unknown>)[key]
      if (value === undefined && !data.hasOwnProperty(key)) {
        // If the key is not present, the guard must represent an optional property
        return optionalSymbol in guard
      }

      return guard(value)
    })
/**
 * Objects have a fixed set of properties that can have different types.
 *
 * ```ts
 * const isUser = object({
 *   id: isNumber,
 *   uid: isString,
 *   active: isBoolean,
 * })
 * ```
 * @param schema maps keys to validation functions.
 */
export const objectGuard = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
}) => {
  const schemaEntries = Object.entries(schema)
  const guards = schemaEntries.map(([_, guard]) => guard)
  const body = [`return typeof data === 'object'`, `data !== null`]
    .concat(
      schemaEntries.map(([unescapedKey, guardFunction], i) => {
        const sanitizedKey = JSON.stringify(unescapedKey)
        const value = `data[${sanitizedKey}]`
        const guard = `guards[${i}]`
        const isOptional = guardFunction[optionalSymbol] === true
        return isOptional
          ? `(${value} === undefined && !data.hasOwnProperty(${sanitizedKey}) || ${guard}(${value}))`
          : `(${value} === undefined && !data.hasOwnProperty(${sanitizedKey}) ? false : ${guard}(${value}))`
      }),
    )
    .join(' && ')
  const fun = new Function('data', 'optionalSymbol', 'guards', body)
  return (
    data: unknown,
  ): data is Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>> => fun(data, optionalSymbol, guards)
}
