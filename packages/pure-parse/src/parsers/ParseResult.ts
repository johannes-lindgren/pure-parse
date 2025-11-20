import { Parser } from './Parser'
import { formatResult } from './formatting'

/*
 * Type Definitions
 */

/**
 * The data adheres to the schema. The `value` is equal to the parsed data
 */
export type ParseSuccess<T> = {
  tag: 'success'
  value: T
  error?: never
}

/**
 * The parsing failed.
 */
export type ParseFailure = {
  tag: 'failure'
  error: Failure
}

export type Failure = {
  message: string
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

/**
 * Describes the result of a parsing operation.
 * The `tag` and `error` properties can be used to distinguish between success and failure.
 * @example
 * Use `error` to distinguish between success and failure:
 * ```ts
 * const result = parseNumber(data)
 * if(result.error) {
 *   console.error(formatResult(result))
 *   return
 * }
 * console.log(result.value)
 * ```
 * @example
 * Use `tag` to distinguish between success and failure:
 * ```ts
 * const result = parseNumber(data)
 * switch (result.tag) {
 *   case 'failure':
 *    console.error(formatResult(result))
 *    break
 *   case 'success':
 *    console.log(result.value)
 *    break
 */
export type ParseResult<T> = ParseSuccess<T> | ParseFailure

/**
 * *****************************
 * Utilities
 * *****************************
 */

/**
 * Create a successful parsing result.
 * @example
 * ```ts
 * const customParser: Parser<number> = (data) => {
 *   if (typeof data === 'number') {
 *    return success(data)
 *   }
 *   return failure('Expected a number')
 * }
 * @param value
 */
export const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  value,
})

/**
 * Create a failure parsing result.
 * @example
 * ```ts
 * const customParser: Parser<number> = (data) => {
 *   if (typeof data === 'number') {
 *    return success(data)
 *   }
 *   return failure('Expected a number')
 * }
 * ```
 * @param message
 */
export const failure = (message: string): ParseFailure => ({
  tag: 'failure',
  error: {
    message,
    path: [],
  },
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
  error: {
    message: failureRes.error.message,
    path: [pathSegment, ...failureRes.error.path],
  },
})

/**
 * Transform a successful result to a new value.
 * @example
 * Transform a successful parse result to a different type:
 * ```ts
 * const idResult = parseNumber(123)
 * mapParseResult(idResult, (id) => id.toString()) // -> ParseSuccess<'123'>
 * ```
 * @see `map`
 * @param result
 * @param fn
 */
export const mapSuccess = <A, B>(
  result: ParseResult<A>,
  fn: (value: A) => B,
): ParseResult<B> => (isSuccess(result) ? success(fn(result.value)) : result)

/**
 * Chain together a sequence of computations that may fail.
 * @example
 * ```
 * const result = parseNumber(5)
 * flatMapSuccess(result, (value) => success(value * 2)) // -> ParseSuccess<10>
 * ```
 * @see `chain`
 * @param result
 * @param fn
 */
export const flatMapSuccess = <T, U>(
  result: ParseResult<T>,
  fn: (value: T) => ParseResult<U>,
): ParseResult<U> => (isSuccess(result) ? fn(result.value) : result)

/**
 * Transform a failure.
 * @example
 * An error contains too ambiguous information:
 * ```ts
 * const idResult = parseNumberFromString('abc')
 * mapFailure(idResult, (error) => ({ message: 'An ID must be a number', path: error.path }))
 * ```
 * Map a failure result to a new value.
 * @param result
 * @param fn
 */
export const mapFailure = <T>(
  result: ParseResult<T>,
  fn: (failure: Failure) => Failure,
): ParseResult<T> =>
  isFailure(result)
    ? {
        tag: 'failure',
        error: fn(result.error),
      }
    : result

/**
 * Recover from a failure by providing an alternative parsing result.
 * @example
 * ```
 * const result = parseNumberFromString('abc')
 * flatMapFailure(result, (error) => success(0)) // -> ParseSuccess<0>
 * ```
 * @see `withDefault`
 * @param result
 * @param fn
 */
export const flatMapFailure = <T>(
  result: ParseResult<T>,
  fn: (result: Failure) => ParseResult<T>,
): ParseResult<T> => (isSuccess(result) ? result : fn(result.error))

const panic = (message: string): never => {
  throw new Error(message)
}

/**
 * Unwrap a successful parsing result, or throw an error if it is a failure.
 * DANGER: This function can throw!
 * @example
 * Assert that a parsing result is successful:
 * ```ts
 * const result = parseNumberFromString('1')
 * const one = unwrap(result) // -> 123
 * const two = one + 1 // No need to map the Result type
 * ```
 * @example
 * But be aware, this _will_ throw if the result is a failure:
 * ```ts
 * const result = parseNumberFromString('abc')
 * const value = unwrap(result) // Throws!
 * const value2 = value + 1 // Never reached :(
 * ```
 * @param value
 */
export const unwrap = <T>(value: ParseResult<T>): T =>
  isSuccess(value)
    ? value.value
    : panic(`Tried to unwrap a ParseFailure: ${formatResult(value)}`)
