import { Primitive } from '../common'
import { Guard } from './types'

/**
 * Literals types represent single values of primitive types; for example, `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values.
 * @example
 * ```ts
 * const parseRed = equalsGuard('red')
 * const parseOne = equalsGuard(1)
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