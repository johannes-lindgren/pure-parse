import { describe, it, expect } from 'vitest'
import { isNumber, isString } from './validation'
import { objectParser } from './parse'

describe('parsing', () => {
  describe('objects', () => {
    it('falls back the entire object if the object does not validate', () => {
      const parseUser = objectParser<{
        id: number
      }>({
        id: isNumber,
      }, () => ({
        id: -1
      }))
      expect(parseUser({
        id: 'abc'
      })).toEqual({
        id: -1
      })
    })
    it('falls back individual properties if the property values do not validate', () => {
      const parseUser = objectParser<{
        id: number
      }>({
        id: (data) => -1,
      }, () => ({
        // NOTE: different than the other fallback value
        id: 0
      }))
      expect(parseUser({
        id: 'abc'
      })).toEqual({
        id: -1
      })
    })
  })
})