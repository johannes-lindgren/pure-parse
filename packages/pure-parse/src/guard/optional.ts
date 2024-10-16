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
 * const isUser = object<User>({
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
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a guard represents an optional value.
   */
  Object.assign(unionGuard(isUndefined, guard), {
    [optionalSymbol]: true,
  }) as OptionalGuard<T>
/**
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for `optional(union(isNull, guard))`.
 * @param guard
 */
export const optionalNullableGuard = <T>(guard: Guard<T>) =>
  optionalGuard(unionGuard(isNull, guard))
/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for `union(isNull, guard)`.
 * @param guard
 */
export const nullableGuard = <T>(guard: Guard<T>) => unionGuard(isNull, guard)
/**
 * Create a union with `undefined`, which is different from optional properties. Alias for `union(isUndefined, guard)`.
 * @param guard
 */
export const undefineableGuard = <T>(guard: Guard<T>) =>
  unionGuard(isUndefined, guard)
