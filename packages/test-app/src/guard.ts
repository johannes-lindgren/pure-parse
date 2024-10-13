import { arrayGuard, isNumber, objectGuard } from 'pure-parse'

/**
 * Just for CI/CD testing: the actual UI doesn't matter
 */

export const guardTests = [
  ['isNumber(1)', isNumber(1)],
  ['object({ a: isNumber })({ a: 1 })', objectGuard({ a: isNumber })({ a: 1 })],
  ['array(isNumber)([1,2,3])', arrayGuard(isNumber)([1, 2, 3])],
]
