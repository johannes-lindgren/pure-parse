import { OmitProperty } from '../internals'
import { ParseFailure, ParseResult, ParseSuccess } from './ParseResult'

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

/**
 * A parser that always succeeds
 */
export type InfallibleParser<T> = (data: unknown) => ParseSuccess<T>
/**
 * A parser that always fails
 */
export type UnsuccessfulParser = (data: unknown) => ParseFailure
