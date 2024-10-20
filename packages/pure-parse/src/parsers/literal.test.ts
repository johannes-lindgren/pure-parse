import { describe, expect, it, test } from 'vitest'
import { literal } from './literal'
import { withDefault } from './fallback'

describe('literals', () => {
  it('todo', () => {
    const parseLiteral = literal('a')
    expect(parseLiteral('a')).toEqual({
      tag: 'success',
      value: 'a',
    })
  })
  test('with fallbackValue', () => {
    const parseLiteral = withDefault(literal('#FF0000'), '#00FF00')
    expect(parseLiteral('#XXYYZZ')).toEqual({
      tag: 'success',
      value: '#00FF00',
    })
  })
})
