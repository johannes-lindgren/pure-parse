import {
  array,
  isNumber,
  object,
  parseJson,
  isJsonValue,
} from 'pure-parse/validate'

/**
 * Just for CI/CD testing: the actual UI doesn't matter
 */

export const validationTests = [
  ['isNumber(1)', isNumber(1)],
  ['object({ a: isNumber })({ a: 1 })', object({ a: isNumber })({ a: 1 })],
  ['array(isNumber)([1,2,3])', array(isNumber)([1, 2, 3])],
  [
    'parseJson(object({ a: isNumber }))(JSON.stringify({ a: 1 }))',
    parseJson(object({ a: isNumber }))(JSON.stringify({ a: 1 })),
  ],
  ['isJsonValue({ a: 1 })', isJsonValue({ a: 1 })],
]
