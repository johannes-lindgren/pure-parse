import { Parser } from './Parser'

/*
 * Type Definitions
 */

/**
 * *****************************
 * The data adheres to the schema. The `value` is equal to the parsed data
 * *****************************
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
  error: {
    message: string
    path: PathSegment[]
  }
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

export const failure = (message: string): ParseFailure => ({
  tag: 'failure',
  error: {
    message,
    path: [],
  },
})

/**
 * *****************************
 * Utilities
 * *****************************
 */

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
