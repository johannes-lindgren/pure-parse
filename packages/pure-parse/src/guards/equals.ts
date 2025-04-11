import { Primitive } from '../common'
import { Guard } from './types'

/**
 * Compares the input against a list of primitive values with the strict equality operator (`===`).
 * The inferred type of the guard is that of a literal type; for example, `equalsGuard('red')` returns a `Guard<'red'>`.
 * @example
 * ```ts
 * const isRed = equalsGuard('red')
 * isRed('red') // -> true
 * isRed('blue') // -> false
 *
 * const isOne = equalsGuard(1)
 * isOne(1) // -> true
 * isOne(2) // -> false
 * ```
 * @example
 * Commonly used in discriminated unions:
 * ```ts
 * const isResult = oneOfGuard([
 *  objectGuard({
 *    tag: equalsGuard('success')
 *  }),
 *  objectGuard({
 *    tag: equalsGuard('error')
 *   }),
 * ])
 * ```
 * @param constant compared against `data` with the `===` operator.
 */
export const equalsGuard =
  <const T extends Primitive>(constant: T): Guard<T> =>
  (data: unknown): data is T =>
    constant === data
