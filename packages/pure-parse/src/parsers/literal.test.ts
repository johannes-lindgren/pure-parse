import { describe, expect, it, test } from 'vitest'
import { literal } from './literal'
import { oneOf } from './oneOf'

import { succeedWith } from './defaults'

describe('literals', () => {
  it('todo', () => {
    const parseLiteral = literal('a')
    expect(parseLiteral('a')).toEqual({
      tag: 'success',
      value: 'a',
    })
  })
  test('with fallbackValue', () => {
    const parseLiteral = oneOf(literal('#FF0000'), succeedWith('#00FF00'))
    expect(parseLiteral('#XXYYZZ')).toEqual({
      tag: 'success',
      value: '#00FF00',
    })
  })
})
