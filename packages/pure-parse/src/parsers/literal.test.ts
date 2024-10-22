import { describe, expect, it, test } from 'vitest'
import { literal } from './literal'
import { oneOf } from './oneOf'
import { always } from './always'

describe('literals', () => {
  it('todo', () => {
    const parseLiteral = literal('a')
    expect(parseLiteral('a')).toEqual({
      tag: 'success',
      value: 'a',
    })
  })
  test('with fallbackValue', () => {
    const parseLiteral = oneOf(literal('#FF0000'), always('#00FF00'))
    expect(parseLiteral('#XXYYZZ')).toEqual({
      tag: 'success',
      value: '#00FF00',
    })
  })
})
