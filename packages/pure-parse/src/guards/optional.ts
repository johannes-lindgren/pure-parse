import { Guard, OptionalGuard } from './types'
import { unionGuard } from './union'
import { isNull, isUndefined } from './primitives'
import { optionalSymbol } from '../internals'

/**
 * Represent an optional property. Note that in TypeScript, optional properties may be assigned `undefined` or omitted entirely from the object.
 * @example
 * Wrap properties in `optional` to make them optional:
 * ```ts
 * type User = {
 *  id: number
 *  email?: string
 * }
 * const isUser = objectGuard<User>({
 *   id: isNumber,
 *   email: optionalGuard(isString),
 * })
 * isUser({ id: 123 }) // -> true
 * isUser({ id: 123, email: undefined }) // -> true
 * isUser({ id: 123, email: 'abc@test.com' }) // -> true
 * ```
 * @param guard
 */
export const optionalGuard = <T>(guard: Guard<T>): OptionalGuard<T> =>
  // Note that the type of isOptionalSymbol is not taken into account
  unionGuard(isOptionalSymbol, isUndefined, guard) as OptionalGuard<T>

/**
 * Non-exported function to check if a value is the optional symbol.
 * The type predicate is deliberately inaccurate to provide more accurate type inference in object validators
 * @param data To represent optional properties in objects, pass {@link optionalSymbol} as argument.
 * @return `true` if `data` equals {@link optionalSymbol}. This indicates that the property was allowed to be omitted.
 */
const isOptionalSymbol = (data: unknown): data is undefined =>
  data === optionalSymbol

/**
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for `optional(unionGuard(isNull, guard))`.
 * @param guard
 */
export const optionalNullableGuard = <T>(guard: Guard<T>) =>
  optionalGuard(unionGuard(isNull, guard))
/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for `unionGuard(isNull, guard)`.
 * @param guard
 */
export const nullableGuard = <T>(guard: Guard<T>) => unionGuard(isNull, guard)
/**
 * Create a union with `undefined`, which is different from optional properties. Alias for `unionGuard(isUndefined, guard)`.
 * @param guard
 */
export const undefineableGuard = <T>(guard: Guard<T>) =>
  unionGuard(isUndefined, guard)
