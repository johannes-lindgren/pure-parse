import { Parser } from '../parse'
import { Validator } from '../validate'

/**
 * Extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type Infer<T extends Validator<unknown> | Parser<unknown>> =
  T extends Parser<infer R> ? R : T extends Validator<infer R> ? R : never
