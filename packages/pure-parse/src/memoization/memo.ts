import { Parser } from '../parse'
import { Guard } from '../guard'
import { optionalSymbol } from '../internals'

/**
 * Memoizes a validator function—a parser or a guard.
 * Internally, a memoized function uses a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) to prevent memory leaks.
 * @example
 * const parseUser = memo(object({
 *  id: parseNumber,
 *  name: parseString,
 * }))
 * @example
 * It can be used to for nested properties
 * ```ts
 * const parseUser = object({
 *   id: parseNumber,
 *   name: parseString,
 *   address: memo(object({
 *     street: parseString,
 *     city: parseString,
 *   })),
 * })
 * ```
 * @param validator A parser or guard function.
 * @returns A memoized version of `validator`.
 */
export const memo = <T extends (arg: object) => unknown>(validator: T): T => {
  const cache = new WeakMap()
  const fn = ((arg) => {
    if (cache.has(arg)) {
      return cache.get(arg)
    }
    const result = validator(arg)
    cache.set(arg, result)
    return result
  }) as T
  // @ts-expect-error
  return validator[optionalSymbol]
    ? Object.assign(
        {
          [optionalSymbol]: true,
        },
        fn,
      )
    : fn
}

/**
 * Given a higher order function that constructs a validator, returns a new function that also constructs a validator, but the validator will be memoized.
 * @example
 * const objectMemo = memo2(object)
 * const parseUser = objectMemo({
 *  id: parseNumber,
 *  name: parseString,
 * })
 * @param validatorConstructor A higher order function that takes a schema and constructs a validator—a parser or a guard.
 * @returns A function of the same type of `validatorConstructor`, but when called, the returned function is memoized.
 */
export const memoizeValidatorConstructor = <
  T extends (schema: any) => Parser<unknown> | Guard<unknown>,
>(
  validatorConstructor: T,
): T => ((schema) => memo(validatorConstructor(schema))) as T
