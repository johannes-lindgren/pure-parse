import { Parser } from './Parser'

/**
 * The data adheres to the schema. The `value` is equal to the parsed data
 */
export type ParseSuccess<T> = {
  tag: 'success'
  value: T
}

/**
 * The parsing failed.
 */
export type ParseFailure = {
  tag: 'failure'
  error: string
  path: PathSegment[]
}

/**
 * Describes the path in a data structure where parsing failed.
 */
export type PathSegment =
  | {
      tag: 'object'
      key: string
    }
  | {
      tag: 'array'
      index: number
    }

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  value,
})

export const failure = (error: string): ParseFailure => ({
  tag: 'failure',
  error,
  path: [],
})

/**
 * Propagate a failure result in a nested structure.
 * When parsing objects and arrays with nested values, the failure at the root level should convey where in the hierarchy the failure occurred.
 * @param failureRes
 * @param pathSegment
 */
export const propagateFailure = (
  failureRes: ParseFailure,
  pathSegment: PathSegment,
): ParseFailure => ({
  tag: 'failure',
  error: failureRes.error,
  path: [pathSegment, ...failureRes.path],
})

/**
 * Check if the result is a success
 * @param result
 */
export const isSuccess = <T>(
  result: ParseResult<T>,
): result is ParseSuccess<T> => result.tag === 'success'

/**
 * Check if the result is a failure
 * @param result
 */
export const isFailure = <T>(result: ParseResult<T>): result is ParseFailure =>
  result.tag === 'failure'

/**
 * Transform the values of successful results.
 * @param parser
 * @param mapSuccess
 */
export const map =
  <A, B>(parser: Parser<A>, mapSuccess: (value: A) => B): Parser<B> =>
  (value) => {
    const result = parser(value)
    return isSuccess(result) ? success(mapSuccess(result.value)) : result
  }

/**
 * Transform successful results into either success or failure.
 * This is useful for chaining parsers.
 * @example
 * After parsing an array of numbers, ensure it is non-empty:
 * ```
 * const parseNonEmptyArray = chain(array(parseNumber), (value) =>
 *           value.length > 0
 *             ? success(value)
 *             : failure('Expected non-empty array'),
 *         )
 * ```
 * @alias flatMapSuccess
 * @param parser
 * @param parseSuccess
 */
export const chain =
  <A, B>(
    parser: Parser<A>,
    parseSuccess: (value: A) => ParseResult<B>,
  ): Parser<B> =>
  (value) => {
    const result = parser(value)
    return isSuccess(result) ? parseSuccess(result.value) : result
  }

export const flatMapSuccess = chain

/**
 * Transform failed results into either success or failure.
 * This is useful for error handling.
 * @example
 * Fall back to a default value if parsing fails:
 * ```
 * const parseCount = recover(
 *   parseNumber,
 *   () => 0
 * )
 * ```
 * @alias flatMapFailure
 * @param parser
 * @param parseFailure
 */
export const recover =
  <A>(
    parser: Parser<A>,
    parseFailure: (error: ParseFailure) => ParseResult<A>,
  ): Parser<A> =>
  (value) => {
    const result = parser(value)
    return isFailure(result) ? parseFailure(result) : result
  }

export const flatMapFailure = recover
