import { OptionalParser, Parser } from './types'
import { parseNull, parseUndefined } from './primitives'
import { optionalSymbol } from '../internals'
import { union } from './union'

/**
 * Represent an optional property in an object. It is supposed to be used in combination with `object`.
 * This function is special because it is used internally by `object` to differentiate between optional properties from required properties that can be `undefined`.
 * @example
 * Wrap properties in `optional` to make them optional:
 * ```ts
 * type User = {
 *  id: number
 *  email?: string
 * }
 * const parseUser = object<User>({
 *   id: parseNumber,
 *   email: optional(parseString),
 * })
 * parseUser({ id: 123 }) // => ParseSuccess
 * parseUser({ id: 123, email: undefined }) // => ParseSuccess
 * parseUser({ id: 123, email: 'abc@test.com' }) // => ParseSuccess
 * ```
 * If `email` instead was defined as a union of `string` and `undefined`, the first call to `parseUser` would fail.
 * @param parser A parser to parse the property with.
 * @return a special parser that represents an optional value. If invoked directly, it behaves the same as `union(parseUndefined, parser)`. If invoked by `object`, `object` will treat the property as optional.
 */
export const optional = <T>(parser: Parser<T>): OptionalParser<T> =>
  /*
   * { [optionalValue]: true } is used at runtime by `object` to check if a parser represents an optional value.
   */
  Object.assign(union(parseUndefined, parser), {
    [optionalSymbol]: true,
  }) as unknown as OptionalParser<T>

/**
 * Represents a value that can be `null`. Shorthand for `union(parseNull, parser)`.
 * @example
 * const parseNullableString = nullable(parseString)
 * parseNullableString(null) // => ParseSuccess<string | null>
 * parseNullableString('abc') // => ParseSuccess<string | null>
 * @param parser a parser function.
 */
export const nullable = <T>(parser: Parser<T>): Parser<T | null> =>
  union(parseNull, parser)

/**
 * Represents a value that can be `undefined`. Shorthand for `union(parseUndefined, parser)`.
 * @example
 * const parseUndefineableString = undefineable(parseString)
 * parseUndefineableString(undefined) // => ParseSuccess<string | undefined>
 * parseUndefineableString('abc') // => ParseSuccess<string | undefined>
 * @param parser
 */
export const undefineable = <T>(parser: Parser<T>): Parser<T | undefined> =>
  union(parseUndefined, parser)

/**
 * Represents an optional property that can also be null. Shorthand for `optional(union(parseNull, parser))`.
 * @param parser a parser function.
 */
export const optionalNullable = <T>(
  parser: Parser<T>,
): OptionalParser<T | null> => optional(nullable(parser))
