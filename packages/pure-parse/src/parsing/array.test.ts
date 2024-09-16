import { describe, expect, it, test } from 'vitest'
import { array } from './array'
import { failure, success, successFallback } from './parse'

import { literal, parseNumber, parseString } from './primitives'
import { fallback } from './fallback'

describe('arrays', () => {
  it('validates when all elements pass validation', () => {
    const parseArr = array(literal('a'))
    expect(parseArr(['a', 'a'])).toEqual({
      tag: 'success',
      value: ['a', 'a'],
    })
  })
  it('invalidates when any elements pass validation', () => {
    const parseArr = array(literal('a'))
    expect(parseArr(['a', 'b'])).toHaveProperty('tag', 'failure')
  })
  test('with fallback', () => {
    const parseArr = array(fallback(literal('#FF0000'), '#00FF00'))
    expect(parseArr(['#FF0000', '#FF0000'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#FF0000'],
      }),
    )
    expect(parseArr(['#FF0000', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#00FF00'],
      }),
    )
    expect(parseArr(['#XXYYZZ', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#00FF00', '#00FF00'],
      }),
    )
    expect(parseArr(['#FF0000', '#XXYYZZ', '#FF0000', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#00FF00', '#FF0000', '#00FF00'],
      }),
    )
  })
  test('that the result type is infallible', () => {
    const res = fallback(parseString, '')(123)
    const a1: typeof res = success('')
    const a2: typeof res = successFallback('')
    // @ts-expect-error -- fallback result is infallible
    const a3: typeof res = failure('')
  })
  describe('referential preservation', () => {
    describe('shallow arrays', () => {
      it('should return the same reference when elements pass validation', () => {
        const parseStr = array(parseNumber)
        const arr = [1, 2, 3, 4]
        const res = parseStr(arr)
        if (res.tag === 'failure') {
          throw new Error('Expected success')
        }
        expect(res.value).toBe(arr)
      })
      it('should return the same reference when elements fail validation', () => {
        const parseStr = array(fallback(parseNumber, 0))
        const arr = [1, 2, '3', 4]
        const res = parseStr(arr)
        if (res.tag === 'failure') {
          throw new Error('Expected success')
        }
        expect(res.value).not.toBe(arr)
      })
    })
    describe('deep arrays', () => {
      it('should return the same reference when nested elements pass validation', () => {
        const parseStr = array(array(parseNumber))
        const arr = [
          [1, 2],
          [3, 4],
        ]
        const res = parseStr(arr)
        if (res.tag === 'failure') {
          throw new Error('Expected success')
        }
        expect(res.value).toBe(arr)
        expect(res.value[0]).toBe(arr[0])
        expect(res.value[1]).toBe(arr[1])
      })
      it('should return a new reference when nested elements fail validation', () => {
        const parseStr = array(array(fallback(parseNumber, 0)))
        const arr = [
          [1, 2],
          [3, '4'],
        ]
        const res = parseStr(arr)
        if (res.tag === 'failure') {
          throw new Error('Expected success')
        }
        expect(res.value).not.toBe(arr)
        expect(res.value[0]).toBe(arr[0])
        expect(res.value[1]).not.toBe(arr[1])
      })
    })
  })
  describe.todo('self-referential arrays')
})
