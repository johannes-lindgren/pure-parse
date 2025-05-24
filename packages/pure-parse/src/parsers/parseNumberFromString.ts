import { failure, Parser, success } from './types'
import { isString } from '../guards'

/**
 * Parses a number from a string without any suprises. Strings that describe numbers (without any other characters involved) yield
 * `number`. All other combinations of characters yield `undefined`.
 */
const numberFromString = (str: string): number | undefined => {
  const parsed = Number(str)
  return str !== '' && !hasWhiteSpace(str) && !isNaN(parsed) && isFinite(parsed)
    ? parsed
    : undefined
}

/**
 * @param str
 * @returns `true` if any character is whitespace.
 */
const hasWhiteSpace = (str: string): boolean => {
  return /\s+/.test(str)
}

/**
 * Parses a number from a stringified number. The result is always a `number`, and never `NaN` or `±Infinity`.
 * Strings that describe numbers (without any other characters involved) yield results.
 * Numbers that can be represented in binary, octal, decimal, hexadecimal, and scientific format are supported.
 * @param data
 */
export const parseNumberFromString: Parser<number> = (data) => {
  if (!isString(data)) {
    return failure('Expected a stringified number but did not get a string')
  }
  if (data === '') {
    return failure('Expected a stringified number but got an empty string')
  }
  if (hasWhiteSpace(data)) {
    return failure(
      'Expected a stringified number but got a string with whitespace',
    )
  }
  const parsed = Number(data)

  if (isNaN(parsed) || !isFinite(parsed)) {
    return failure(
      `Expected a stringified number but got ${JSON.stringify(data)}`,
    )
  }
  return success(parsed)
}
