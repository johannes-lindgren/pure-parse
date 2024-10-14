import { Guard, OptionalGuard } from './types'
import { union } from './union'
import { isNull, isUndefined } from './primitives'
import { optionalSymbol } from '../internals'

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param guard
 */
export const optional = <T>(guard: Guard<T>): OptionalGuard<T> =>
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a guard represents an optional value.
   */
  Object.assign(union(isUndefined, guard), {
    [optionalSymbol]: true,
  }) as OptionalGuard<T>
/**
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for `optional(union(isNull, guard))`.
 * @param guard
 */
export const optionalNullable = <T>(guard: Guard<T>) =>
  optional(union(isNull, guard))
/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for `union(isNull, guard)`.
 * @param guard
 */
export const nullable = <T>(guard: Guard<T>) => union(isNull, guard)
/**
 * Create a union with `undefined`, which is different from optional properties. Alias for `union(isUndefined, guard)`.
 * @param guard
 */
export const undefineable = <T>(guard: Guard<T>) => union(isUndefined, guard)
