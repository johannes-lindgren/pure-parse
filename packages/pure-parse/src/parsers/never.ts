import { UnsuccessfulParser } from './Parser'
import { failure } from './ParseResult'

/**
 * A parser that always fails. Parsing `never` always fails because no value can be assigned to `never`—`never` corresponds to an empty set of values.
 * @see {@link parseUnknown} for a counterpart
 * @param data data to be validated
 */
export const parseNever: UnsuccessfulParser = (data) =>
  failure('Expected error because never cannot be instantiated')
