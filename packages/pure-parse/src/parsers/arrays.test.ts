import { describe, expect, it, test } from 'vitest'
import { array } from './arrays'
import { failure, success } from './types'

import { parseNumber, parseString } from './primitives'
import { withDefault } from './fallback'
import { literal } from './literal'

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
  test('with fallbackValue', () => {
    const parseArr = array(withDefault(literal('#FF0000'), '#00FF00'))
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
    const res = withDefault(parseString, '')(123)
    const a1: typeof res = success('')
    // @ts-expect-error -- fallbackValue result is infallible
    const a3: typeof res = failure('')
  })
  describe.todo('self-referential arrays')
})
