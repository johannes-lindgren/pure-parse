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
