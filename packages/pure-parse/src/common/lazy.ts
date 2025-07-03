/**
 * Creates a lazy-loaded function that initializes the function only when it is called for the first time.
 * With `lazy`, you can create recursive parsers without running into circular dependencies.
 * Also useful to lazily initialize just-in-time compuliled parsers and guards.
 * @example
 * Create recursive parsers with `lazy`.
 * Note that you must use explicit type annotations:
 * ```ts
 * import { lazy, type Parser, object, parseString, optional } from 'pure-parse'
 *
 * type Person = {
 *   name: string
 *   father?: Person
 *   mother?: Person
 * }
 * const parsePerson: Parser<Person> = lazy(() =>
 *   object({
 *     name: parseString,
 *     father: optional(parsePerson),
 *     mother: optional(parsePerson),
 *   }),
 * )
 * ```
 * @param constructFn
 */
export const lazy = <T extends (...args: never[]) => unknown>(
  constructFn: () => T,
): T => {
  let fn: T | undefined
  return ((...args) => {
    if (!fn) {
      fn = constructFn()
    }
    return fn(...args)
  }) as T
}
