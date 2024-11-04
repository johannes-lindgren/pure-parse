import { failure, OptionalParser, Parser, success } from './types'
import { parseNull, parseUndefined } from './primitives'
import { OptionalSymbol, optionalSymbol } from '../internals'
import { oneOf } from './oneOf'

/**
 * Represent an optional property in an object. It is supposed to be used in combination with `object`.
 * Note that in TypeScript, optional properties may be assigned `undefined` or omitted entirely from the object.
 * This function is special because it is used internally by `object` to differentiate between optional properties from required properties that can be `undefined`.
 * Only use this in objects: despite the type signature, it _can_ return {@link optionalSymbol} to indicate that the property was omitted from the object.
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
 * parseUser({ id: 123 }) // -> ParseSuccess
 * parseUser({ id: 123, email: undefined }) // -> ParseSuccess
 * parseUser({ id: 123, email: 'abc@test.com' }) // -> ParseSuccess
 * ```
 * If `email` instead was defined as a union of `string` and `undefined`, the first call to `parseUser` would fail.
 * @param parser A parser to parse the property with.
 * @return a special parser that represents an optional value. If invoked directly, it behaves the same as `oneOf(parseUndefined, parser)`. If invoked by `object`, `object` will treat the property as optional.
 */
export const optional = <T>(parser: Parser<T>): OptionalParser<T> =>
  // Note that the type of parseOptionalSymbol is not taken into account
  oneOf(parseOptionalSymbol, parseUndefined, parser) as OptionalParser<T>

/**
 * Non-exported function to check if a value is the optional symbol.
 * The type predicate is deliberately inaccurate to provide more accurate type inference in object validators.
 * @param data To represent optional properties in objects, pass {@link optionalSymbol} as argument.
 * @return Success of {@link optionalSymbol} if `data` equals {@link optionalSymbol}. This indicates that the property was allowed to be omitted.
 */
const parseOptionalSymbol: Parser<OptionalSymbol> = (data) => {
  return data === optionalSymbol
    ? // This indicates that the property
      success(optionalSymbol)
    : failure('not optional')
}

/**
 * Represents a value that can be `null`. Shorthand for `oneOf(parseNull, parser)`.
 * @example
 * const parseNullableString = nullable(parseString)
 * parseNullableString(null) // => ParseSuccess<string | null>
 * parseNullableString('abc') // => ParseSuccess<string | null>
 * @param parser a parser function.
 */
export const nullable = <T>(parser: Parser<T>): Parser<T | null> =>
  oneOf(parseNull, parser)

/**
 * Represents a value that can be `undefined`. Shorthand for `oneOf(parseUndefined, parser)`.
 * @example
 * const parseUndefineableString = undefineable(parseString)
 * parseUndefineableString(undefined) // => ParseSuccess<string | undefined>
 * parseUndefineableString('abc') // => ParseSuccess<string | undefined>
 * @param parser
 */
export const undefineable = <T>(parser: Parser<T>): Parser<T | undefined> =>
  oneOf(parseUndefined, parser)

/**
 * Represents an optional property that can also be null. Shorthand for `optional(oneOf(parseNull, parser))`.
 * @param parser a parser function.
 */
export const optionalNullable = <T>(
  parser: Parser<T>,
): OptionalParser<T | null> => optional(nullable(parser))
