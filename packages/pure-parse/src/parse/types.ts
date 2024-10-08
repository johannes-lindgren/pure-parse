import { optionalSymbol } from '../internals'

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
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  value,
})

export const failure = (error: string): ParseFailure => ({
  tag: 'failure',
  error,
})

export type Parser<T> = (data: unknown) => ParseResult<T>

export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>

/**
 * Special parser to check optional values
 */
export type OptionalParser<T> = {
  [optionalSymbol]?: true
} & ((data: unknown) => ParseResult<T | undefined>)

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
