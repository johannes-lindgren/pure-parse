import { Parser } from './Parser'
import { failure, success } from './ParseResult'

/**
 * Returns a parser that checks whether the data is an instance of the given constructor.
 * @example
 * ```ts
 * const parseError = instanceOf(Error)
 * parseError(new Error()) // -> Success<Error>
 * ```
 * @param constructor the right-hand side argument of the `instanceof` operator
 */
export const instanceOf =
  <T>(constructor: { new (...args: never[]): T }): Parser<T> =>
  (data) =>
    data instanceof constructor
      ? success(data)
      : failure(`Expected instance of ${constructor}, got ${data}`)
