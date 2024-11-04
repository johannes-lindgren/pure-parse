import { Parser, UnsuccessfulParser } from '../parsers'
import { Guard } from '../guards'

/**
 * Extract the type from a parser or guards
 * - In parsers, extract the type in the type parameter.
 * - In guards, extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 * @example
 * type User = Infer<typeof parseUser>
 * @example
 * type User = Infer<typeof isUser>
 * @limitations Optional `unknown` properties will be inferred as required. At runtime, the property _is_ optional: only the inferred type has a discrepancy. For most use cases, this is not a problem. If you are adamant on being correct, consider declaring the type instead of inferring it (see the following section). This edge case is a small compromise between ease-of-use and type correctness.
 * @typeParam T — a parser or guard
 */
export type Infer<T extends Guard<unknown> | Parser<unknown>> =
  T extends UnsuccessfulParser
    ? // The value type of parsers that never succeed will be `never`
      never
    : T extends Parser<infer R>
      ? R
      : T extends Guard<infer R>
        ? R
        : never
