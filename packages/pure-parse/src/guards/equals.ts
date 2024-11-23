import { Primitive } from '../common'
import { Guard } from './types'

/**
 * Compares the input against a list of primitive values with the strict equality operator (`===`).
 * The inferred type of the guard is that of a literal type; for example, `equalsGuard('red')` returns a `Guard<'red'>`.
 * When called with multiple arguments, the guard will return `true` if the input equals to any of the provided values,
 * and thus return a union type.
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
 * @example
 * If you pass in multiple values, the guard will validate a union type:
 * ```ts
 * const isLogLevel = equalsGuard('debug', 'info', 'warning', 'error')
 * ```
 * @example
 * When explicitly annotating unions, provide a tuple of the union members as type argument:
 * ```ts
 * const isColor = equalsGuard<['red', 'green', 'blue']>('red', 'green', 'blue')
 * ```
 * @param constants compared against `data` with the `===` operator.
 */
export const equalsGuard =
  <const T extends readonly [...Primitive[]]>(
    ...constants: T
  ): Guard<T[number]> =>
  (data: unknown): data is T[number] =>
    constants.some((constant) => constant === data)
