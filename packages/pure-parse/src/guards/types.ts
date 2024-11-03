import { optionalSymbol } from '../internals'

/**
 * A function that returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates) on the argument.
 */
export type Guard<T> = (data: unknown) => data is T

/**
 * Special guard to check optional values
 */
export type OptionalGuard<T> = (data: unknown) => data is T | undefined
