import { describe, expect, it, test } from 'vitest'
import { fallback } from './fallback'
import { parseString } from './primitives'
import { object } from './object'

describe('fallback', () => {
  test('as a root parser', () => {
    const parseStr = fallback(parseString, 'fallback')
    expect(parseStr('hello')).toEqual(
      expect.objectContaining({
        value: 'hello',
      }),
    )
    expect(parseStr(123)).toEqual(
      expect.objectContaining({
        value: 'fallback',
      }),
    )
  })
  test('as a nested parser', () => {
    const parseObj = object({
      name: fallback(parseString, 'fallback'),
    })
    expect(parseObj({ name: 'hello' })).toEqual(
      expect.objectContaining({
        value: { name: 'hello' },
      }),
    )
  })
  describe('referential preservation', () => {
    test('parsing success, where the reference is preserves', () => {
      const parseStr = fallback(parseString, 'fallback')
      expect(parseStr('hello')).toHaveProperty('tag', 'success')
    })
    test('parsing failure with fallback, where the reference is preserves', () => {
      const parseStr = fallback(parseString, 'fallback')
      expect(parseStr(123)).toHaveProperty('tag', 'success-fallback')
    })
  })
  describe('fallback on fallback', () => {
    it('uses the first fallback', () => {
      const parseStr = fallback(fallback(parseString, 'fallback'), 'fallback2')
      expect(parseStr('hello')).toEqual(
        expect.objectContaining({
          value: 'hello',
        }),
      )
      expect(parseStr(123)).toEqual(
        expect.objectContaining({
          value: 'fallback',
        }),
      )
    })
  })
  test.todo('on optional properties')
})
