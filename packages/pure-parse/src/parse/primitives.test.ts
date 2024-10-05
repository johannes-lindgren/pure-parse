import { describe, expect, it, test } from 'vitest'
import { literal } from './primitives'
import { fallback } from './fallback'

describe('primitives', () => {
  describe.todo('null')
  describe.todo('undefined')
  describe.todo('boolean')
  describe.todo('number')
  describe.todo('bigint')
  describe.todo('string')
  describe.todo('symbol')
  describe('literals', () => {
    it('todo', () => {
      const parseLiteral = literal('a')
      expect(parseLiteral('a')).toEqual({
        tag: 'success',
        value: 'a',
      })
    })
    test('with fallback', () => {
      const parseLiteral = fallback(literal('#FF0000'), '#00FF00')
      expect(parseLiteral('#XXYYZZ')).toEqual({
        tag: 'success-fallback',
        value: '#00FF00',
      })
    })
  })
})
