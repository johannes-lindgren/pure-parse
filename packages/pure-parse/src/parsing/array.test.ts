import { describe, expect, it, test } from 'vitest'
import { array } from './array'
import { failure, fallback, success, successFallback } from './parse'

import { literal, parseString } from './primitives'

describe('arrays', () => {
  it('todo', () => {
    const parseArr = array(literal('a'))
    expect(parseArr(['a', 'a'])).toEqual({
      tag: 'success',
      value: ['a', 'a'],
    })
    expect(parseArr(['a', 'b'])).toHaveProperty('tag', 'failure')
  })
  test('with fallback', () => {
    const parseArr = array(fallback(literal('#FF0000'), '#00FF00'))
    expect(parseArr(['#FF0000', '#FF0000'])).toEqual({
      tag: 'success',
      value: ['#FF0000', '#FF0000'],
    })
    expect(parseArr(['#FF0000', '#XXYYZZ'])).toEqual({
      tag: 'success',
      value: ['#FF0000', '#00FF00'],
    })
    expect(parseArr(['#XXYYZZ', '#XXYYZZ'])).toEqual({
      tag: 'success',
      value: ['#00FF00', '#00FF00'],
    })
    expect(parseArr(['#FF0000', '#XXYYZZ', '#FF0000', '#XXYYZZ'])).toEqual({
      tag: 'success',
      value: ['#FF0000', '#00FF00', '#FF0000', '#00FF00'],
    })
  })
  test('that the result type is infallible', () => {
    const res = fallback(parseString, '')(123)
    const a1: typeof res = success('')
    const a2: typeof res = successFallback('')
    // @ts-expect-error -- fallback result is infallible
    const a3: typeof res = failure('')
  })
  describe.todo('referential preservation')
})
