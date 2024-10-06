import { optionalSymbol } from './optionalSymbol'

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

export type RequiredParseResult<T> = ParseSuccess<T> | ParseFailure

export type OptionalParseResult<T> = ParseResult<T>

export const success = <T>(value: T): ParseSuccess<T> => ({
  tag: 'success',
  value,
})

export const failure = (error: string): ParseFailure => ({
  tag: 'failure',
  error,
})

export type Parser<T> = (data: unknown) => ParseResult<T>

export type RequiredParser<T> = (data: unknown) => RequiredParseResult<T>

/**
 * Special validator to check optional values
 */
export type OptionalParser<T> = {
  [optionalSymbol]?: true
} & ((data: unknown) => OptionalParseResult<T | undefined>)

export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>

export type FallibleParser<T> = (
  data: unknown,
) => ParseSuccess<T> | ParseFailure

/*
 * Utility types
 */

export type Infer<T extends Parser<unknown>> = T extends Parser<infer D>
  ? D
  : never

/*
 * Utility functions
 */

/**
 * Use to skip validation, as it returns true for any input.
 * @param data
 */
export const parseUnknown = (data: unknown): ParseSuccess<unknown> =>
  success(data)

export const isSuccess = <T>(
  result: ParseResult<T>,
): result is ParseSuccess<T> => result.tag === 'success'
