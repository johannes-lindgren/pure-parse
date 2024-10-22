import { Guard } from './types'

/**
 * Executed `guards` in order and returns true if any guard matches. The result type is a union.
 * @example
 * Commonly used in discriminated unions:
 * ```ts
 * const isResult = unionGuard([
 *  objectGuard({
 *    tag: literalGuard('success')
 *  }),
 *  objectGuard({
 *    tag: literalGuard('error')
 *   }),
 * ])
 * ```
 * @example
 * When explicitly annotating unions, provide a tuple of the union members as type argument:
 * ```ts
 * const isId = union<[string, number]>(isString, isNumber)
 * ```
 * Due to a limitation of TypeScript, it is not possible to write `unionGuard<string | number>()` or `literalGuard<'red' | 'green' | 'blue'>()`. Therefore, it is generally recommended to omit the type arguments for union types and let TypeScript infer them.
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
