import { describe, expect, it, test } from 'vitest'
import { always } from './always'
import { parseString } from './primitives'
import { object } from './object'
import { InfallibleParser, Parser } from './types'
import { oneOf } from './oneOf'

describe('always', () => {
  it('always returns the value in the argument', () => {
    expect(always(0)(0)).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(always(0)(1)).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(always(0)('111')).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(always('hello')(0)).toEqual(
      expect.objectContaining({
        value: 'hello',
      }),
    )
  })
})

const withDefault = <T, F>(
  parser: Parser<T>,
  fallbackValue: F,
): InfallibleParser<T | F> =>
  oneOf(parser, always(fallbackValue)) as InfallibleParser<T | F>

describe('withDefault', () => {
  test('as a root parser', () => {
    const parseStr = withDefault(parseString, 'fallback')
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
      name: withDefault(parseString, 'fallback'),
    })
    expect(parseObj({ name: 'hello' })).toEqual(
      expect.objectContaining({
        value: { name: 'hello' },
      }),
    )
  })
  describe('fallbackValue on fallbackValue', () => {
    it('uses the first fallbackValue', () => {
      const parseStr = withDefault(
        withDefault(parseString, 'fallback'),
        'fallback2',
      )
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
