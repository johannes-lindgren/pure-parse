import { describe, expect, it, test } from 'vitest'
import { literal } from './literal'
import { fallback } from './fallback'

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
      tag: 'success',
      value: '#00FF00',
    })
  })
})
