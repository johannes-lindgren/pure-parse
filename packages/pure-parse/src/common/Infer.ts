import { Parser } from '../parse'
import { Validator } from '../validate'

/**
 * Extract the type from a parser or guards
 * - In parsers, extract the type in the type parameter.
 * - In guards, extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 * @typeParam T — a parser or validator
 */
export type Infer<T extends Validator<unknown> | Parser<unknown>> =
  T extends Parser<infer R> ? R : T extends Validator<infer R> ? R : never
