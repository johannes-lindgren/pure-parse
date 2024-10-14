import { Guard } from './types'

/**
 *
 * @example
 * Commonly used in discriminated unions:
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
 * Annotating a union literal requires you to wrap the types an array:
 * ```ts
 * const isId = union<[string, number]>(isString, isNumber)
 * ```
 * @param guards any of these guard functions must match the data.
 * @return a guard function that validates unions
 */
export const unionGuard =
  <T extends readonly [...unknown[]]>(
    ...guards: {
      [K in keyof T]: Guard<T[K]>
    }
  ) =>
  /**
   * @param data data to be validated
   * @return `true` if the data is in the specified union
   */
  (data: unknown): data is T[number] =>
    guards.some((guard) => guard(data))
