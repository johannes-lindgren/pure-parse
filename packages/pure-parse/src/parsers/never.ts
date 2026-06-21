import { UnsuccessfulParser } from './Parser'
import { failure } from './ParseResult'

/**
 * A parser that always fails.
 *
 * `never` is the bottom type—the empty set of values—so no value can satisfy it.
 * It is the identity element for {@link oneOf}: unioning any parser with `parseNever` yields that parser unchanged, making it the natural base case when folding a list of parsers into a union.
 * Most users will never call it directly; it is primarily present in the library for completeness.
 *
 * @example
 * Always fails:
 * ```ts
 * parseNever(0)      // => ParseFailure
 * parseNever('abc')  // => ParseFailure
 * parseNever(null)   // => ParseFailure
 * ```
 * @param data data to be validated
 * @see {@link parseUnknown} for the opposite: a parser that always succeeds
 */
export const parseNever: UnsuccessfulParser = (data) =>
  failure('Unexpected value. No value can match the type never.')
