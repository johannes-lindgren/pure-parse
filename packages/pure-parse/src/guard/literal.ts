import { Primitive } from '../common'
import { Guard } from './types'

/**
 * @example
 * Commonly used in unions:
 * ```ts
 * const isLogLevel = literal('debug', 'info', 'warning', 'error')
 * ```
 * ```ts
 * const isResult = union([
 *  object({
 *    tag: literal('success')
 *  }),
 *  object({
 *    tag: literal('error')
 *   }),
 * ])
 * ```
 * @example
 * Annotating `literal` requires you to wrap it in an array:
 * ```ts
 * const isColor = literal<['red', 'green', 'blue']>('red', 'green', 'blue')
 * ```
 * @param constants compared against `data` with the `===` operator.
 */
export const literalGuard =
  <const T extends readonly [...Primitive[]]>(
    ...constants: T
  ): Guard<T[number]> =>
  (data: unknown): data is T[number] =>
    constants.some((constant) => constant === data)
