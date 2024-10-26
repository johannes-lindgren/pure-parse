import { failure } from './types'
import { UnsuccessfulParser } from './always'

/**
 * @see {@link always} for a counterpart
 * @param error
 * @return a parser that always fails with `errorMessage`
 */
export const failWith =
  (error: string): UnsuccessfulParser =>
  () =>
    failure(error)

/**
 * A parser that always fails. Parsing `never` always fails because no value can be assigned to `never`—`never` corresponds to an empty set of values.
 * @see {@link parseUnknown} for a counterpart
 * @param data data to be validated
 */
export const parseNever: UnsuccessfulParser = (data) =>
  failure('never cannot be instantiated')
