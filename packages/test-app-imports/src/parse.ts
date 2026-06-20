import { array, parseNumber, object } from 'pure-parse'

/**
 * Just for CI/CD testing: the actual UI doesn't matter
 */

export const parsingTests = [
  ['isNumber(1)', parseNumber(1)],
  ['object({ a: isNumber })({ a: 1 })', object({ a: parseNumber })({ a: 1 })],
  ['array(isNumber)([1,2,3])', array(parseNumber)([1, 2, 3])],
]
