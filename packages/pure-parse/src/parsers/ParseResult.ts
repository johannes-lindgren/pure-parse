import { Parser } from './Parser'

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
