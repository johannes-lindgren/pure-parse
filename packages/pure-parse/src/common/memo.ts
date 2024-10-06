/**
 * Memoizes a function that takes a single object argument.
 * @param fn
 */
export const memo = <T extends (arg: object) => unknown>(fn: T): T => {
  const cache = new WeakMap()
  return ((arg) => {
    if (cache.has(arg)) {
      return cache.get(arg)
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }) as T
}
