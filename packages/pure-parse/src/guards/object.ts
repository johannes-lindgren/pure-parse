import { Guard, OptionalGuard } from './Guard'
import { optionalSymbol } from '../internals'
import { lazy } from '../common'
import { Parser } from '../parsers'
import { OptionalKeys, WithOptionalFields } from '../internals/utility-types'

/**
 * Objects have a fixed set of properties of different types.
 * @example
 * ```ts
 * Object with both required and optional properties:
 * const isUser = objectGuard({
 *   id: isNumber,
 *   uid: isString,
 *   active: isBoolean,
 *   email: optional(isString),
 * })
 * ```
 * Note that optional properties will be inferred as required properties that can be assigned `undefined`. See {@link Infer} > limitations for in-depth information.
 * @example
 * Annotate explicitly:
 * ```ts
 * type User = {
 *   id: number
 *   name: string
 * }
 *
 * const isUser = object<User>({
 *   id: isNumber,
 *   name: isString,
 * })
 * ```
 * @see {@link objectGuardCompiled} for just-in-time compiled version of this function.
 * @param schema maps keys to validation functions.
 */
export const objectGuard = <T extends Record<string, unknown>>(schema: {
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
}): Guard<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> =>
  ((data) =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every((key) => {
      const guard = schema[key]!
      const value = (data as Record<string, unknown>)[key]
      if (value === undefined && !data.hasOwnProperty(key)) {
        // If the key is not present, the guard must represent an optional property
        return guard(optionalSymbol)
      }

      return guard(value)
      // Must be cast to the correct type because TypeScript does not infer the type predicate correctly
    })) as Guard<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>>
/**
 * Same as {@link objectGuard}, but performs just-in-time (JIT) compilation with the `Function` constructor, which greatly increases the execution speed of the validation.
 * However, the JIT compilation is slow and gets executed at the time when the validation function is constructed.
 * When using this function at the module level, it is recommended to wrap it in {@link lazy} to defer the JIT compilation to when the validation function is called for the first time.
 * This function will be blocked in environments where the `Function` constructor is blocked; for example, when the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) policy is set without the `'unsafe-eval`' directive.
 * @example
 * Defer the JIT compilation to when the validation function is called for the first time.
 * ```ts
 * const isUser = lazy(() => objectGuardCompiled({
 *  id: isNumber,
 *  name: isString,
 * })
 * ```
 * @see {@link objectGuard} for a non-just-in-time compiled version of this function.
 * @param schema maps keys to validation functions.
 */
export const objectGuardCompiled = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalGuard<T[K]> : Guard<T[K]>
}): Guard<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
  const schemaEntries = Object.entries(schema)
  const guards = schemaEntries.map(([_, guard]) => guard)
  const body = [`return typeof data === 'object'`, `data !== null`]
    .concat(
      schemaEntries.map(([unescapedKey, guardFunction], i) => {
        const sanitizedKey = JSON.stringify(unescapedKey)
        const value = `data[${sanitizedKey}]`
        const guard = `guards[${i}]`
        return `(${value} === undefined && !data.hasOwnProperty(${sanitizedKey}) ? ${guard}(optionalSymbol) :  ${guard}(${value}))`
      }),
    )
    .join(' && ')
  const fun = new Function('data', 'optionalSymbol', 'guards', body)
  return ((data) => fun(data, optionalSymbol, guards)) as Guard<
    OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>
  >
}
