import { describe, expect, it, test } from 'vitest'
import { array } from './arrays'
import { failure, success } from './types'

import { literal } from './literal'
import { oneOf } from './oneOf'
import { always } from './always'

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
    const parseArr = array(oneOf(literal('#FF0000'), always('#00FF00')))
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
  describe.todo('self-referential arrays')
})
