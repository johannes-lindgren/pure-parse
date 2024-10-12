import { describe, expect, it } from 'vitest'
import { parseJson } from './json'
import { objectGuard, isString, isNumber, isUnknown } from '../guard'

describe('json', () => {
  describe('parseJson', () => {
    it('does not throw errors', () => {
      expect(() => parseJson(isUnknown)('not a json!')).not.toThrow()
    })
    it('returns an error if the parsing failed', () => {
      expect(parseJson(isUnknown)('not a json!')).toBeInstanceOf(Error)
    })
    it('returns an error if the validation failed', () => {
      expect(parseJson(isString)('{}')).toBeInstanceOf(Error)
    })
    it('returns the object if the validation succeeded', () => {
      expect(parseJson(isString)(JSON.stringify('abc'))).toEqual('abc')
      expect(parseJson(isNumber)(JSON.stringify(123))).toEqual(123)
      expect(
        parseJson(objectGuard({ a: isNumber }))(JSON.stringify({ a: 1 })),
      ).toEqual({ a: 1 })
    })
  })
})
