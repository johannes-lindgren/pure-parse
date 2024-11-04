import { OmitProperty } from '../internals'

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
  path: ParseFailurePathSegment[]
}

export type ParseFailurePathSegment =
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

export const propagateFailure = (
  failureRes: ParseFailure,
  pathSegment: ParseFailurePathSegment,
): ParseFailure => ({
  tag: 'failure',
  error: failureRes.error,
  path: [pathSegment, ...failureRes.path],
})

export type Parser<T> = (data: unknown) => ParseResult<T>

/**
 * Special parser to check optional values
 */
export type OptionalParser<T> = (
  data: unknown,
) => ParseResult<T | undefined | OmitProperty>

/**
 * A parser that does not represent an optional property.
 */
export type RequiredParser<T> = (
  data: unknown,
) => ParseResult<Exclude<T, OmitProperty>>

/*
 * Utility functions
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
 * A parser that always succeeds
 */
export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>
/**
 * A parser that always fails
 */
export type UnsuccessfulParser = (data: unknown) => ParseFailure
