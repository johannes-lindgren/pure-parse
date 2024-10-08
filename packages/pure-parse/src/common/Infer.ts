import { Parser } from '../parse'
import { Guard } from '../guard'

/**
 * Extract the type from a parser or guards
 * - In parsers, extract the type in the type parameter.
 * - In guards, extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 * @example
 * type User = Infer<typeof parseUser>
 * @example
 * type User = Infer<typeof isUser>
 * @limitations optional properties will be inferred as required–but undefinable–properties. (This might be due to limitations of TypeScript.) At runtime, the property _is_ optional: only the inferred type has a discrepancy. For most use cases, this is not a problem to worry about. If you are adamant on being correct, consider declaring the type instead of inferring it (see the following section). Future version of this library might provide a solution.
 * @typeParam T — a parser or guard
 */
export type Infer<T extends Guard<unknown> | Parser<unknown>> =
  T extends Parser<infer R> ? R : T extends Guard<infer R> ? R : never
