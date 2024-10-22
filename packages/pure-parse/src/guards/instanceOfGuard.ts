import { Guard } from './types'

/**
 * Returns a guard that checks whether the data is an instance of the given constructor.
 * @example
 * ```ts
 * const isError = instanceOfGuard(Error)
 * isError(new Error()) // -> true
 * ```
 * @param constructor the right-hand side argument of the `instanceof` operator
 */
export const instanceOfGuard =
  <T>(constructor: { new (...args: never[]): T }): Guard<T> =>
  (data: unknown): data is T =>
    data instanceof constructor
