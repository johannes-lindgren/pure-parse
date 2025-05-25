import { InfallibleParser } from './Parser'
import { success } from './ParseResult'

/**
 * A parser that always succeeds.
 * Parsing `unknown` always succeeds because all values can be assigned to `unknown`—`unknown` corresponds to the set of all values.
 * @see {@link parseNever} for a counterpart
 * @example
 * Use to skip validation, as it results in a success for any input.
 * ```ts
 * const parseResponse = object({
 *   status: parseNumber,
 *   data: unknown,
 * })
 * parseResponse({
 *   status: 200,
 *   data: { id: 123, name: 'John' }
 * }) // => ParseSuccess<{ status: number, data: unknown }>
 * ```
 * @param data data to be validated
 */
export const parseUnknown: InfallibleParser<unknown> = (data) => success(data)
