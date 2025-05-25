import { describe, expect, it, test } from 'vitest'
import { withDefault } from './withDefault'
import { parseString } from './primitives'
import { object } from './object'
import { Equals } from '../internals'
import { InfallibleParser } from './Parser'

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
  describe('types', () => {
    describe('type inference', () => {
      it('infers unions', () => {
        const parse = withDefault(parseString, undefined)
        const t1: Equals<
          typeof parse,
          InfallibleParser<string | undefined>
        > = true
      })
      it('infers non-unions', () => {
        const parse = withDefault(parseString, 'default')
        const t1: Equals<typeof parse, InfallibleParser<string>> = true
      })
    })
  })
})
