import { describe, expect, it, test } from 'vitest'
import { equals } from './equals'
import { withDefault } from './withDefault'
import { Parser } from './types'
import { Equals } from '../internals'
import { parseString } from './primitives'

const expectFailure = () => expect.objectContaining({ tag: 'failure' })

describe('equals', () => {
  describe('different data types', () => {
    describe('strings', () => {
      it('validates a string', () => {
        expect(equals('a')('a')).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: 'a',
          }),
        )
      })
      it('invalidates a string', () => {
        expect(equals('a')('b')).toEqual(expectFailure())
      })
      it('invalidates other types', () => {
        const value = 'a' as const
        expect(equals(value)(1)).toEqual(expectFailure())
        // expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })
    describe('numbers', () => {
      it('validates a number', () => {
        expect(equals(1)(1)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: 1,
          }),
        )
      })
      it('invalidates a number', () => {
        expect(equals(1)(2)).toEqual(expectFailure())
      })
      it('invalidates other types', () => {
        const value = 1 as const
        // expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('booleans', () => {
      it('validates a boolean', () => {
        expect(equals(true)(true)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: true,
          }),
        )
      })
      it('invalidates a boolean', () => {
        expect(equals(true)(false)).toEqual(expectFailure())
      })
      it('invalidates other types', () => {
        const value = true as const
        expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        // expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('null', () => {
      it('validates null', () => {
        expect(equals(null)(null)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: null,
          }),
        )
      })
      it('invalidates other types', () => {
        const value = null
        expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        // expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('undefined', () => {
      it('validates undefined', () => {
        expect(equals(undefined)(undefined)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: undefined,
          }),
        )
      })
      it('invalidates other types', () => {
        const value = undefined
        expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        // expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('symbols', () => {
      it('validates a symbol', () => {
        const value = Symbol()
        expect(equals(value)(value)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value,
          }),
        )
      })

      it('invalidates a symbol', () => {
        const value = Symbol()
        expect(equals(value)(Symbol())).toEqual(expectFailure())
      })

      it('invalidates other types', () => {
        const value = Symbol()
        expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        // expect(equals(value)(Symbol())).toEqual(expectFailure())
        expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('bigints', () => {
      it('validates a bigint', () => {
        const value = 1n
        expect(equals(value)(value)).toEqual(
          expect.objectContaining({
            tag: 'success',
            value,
          }),
        )
      })
      it('invalidates a bigint', () => {
        const value = 1n
        expect(equals(value)(2n)).toEqual(expectFailure())
      })
      it('invalidates other types', () => {
        const value = 1n
        expect(equals(value)(1)).toEqual(expectFailure())
        expect(equals(value)('a')).toEqual(expectFailure())
        expect(equals(value)(true)).toEqual(expectFailure())
        expect(equals(value)(null)).toEqual(expectFailure())
        expect(equals(value)(undefined)).toEqual(expectFailure())
        expect(equals(value)({})).toEqual(expectFailure())
        expect(equals(value)([])).toEqual(expectFailure())
        expect(equals(value)(Symbol())).toEqual(expectFailure())
        // expect(equals(value)(1n)).toEqual(expectFailure())
      })
    })

    describe('objects', () => {
      it('cannot validate objects', () => {
        // @ts-expect-error
        equals({})
      })
    })

    describe('arrays', () => {
      it('cannot validate arrays', () => {
        // @ts-expect-error
        equals([])
      })
    })
  })

  describe('type inference', () => {
    const parser0 = equals('a')
    const t0: Equals<typeof parser0, Parser<'a'>> = true
  })

  describe('explicit type annotation', () => {
    it('works with primitives', () => {
      equals<'a'>('a')
      // @ts-expect-error
      equals<'a'>('b')

      equals<1>(1)
      // @ts-expect-error
      equals<1>(2)

      // @ts-expect-error
      equals<'1'>(1)
    })
    it('does not work with reference types', () => {
      // @ts-expect-error
      equals<{ a: 'b' }>({ a: equals('b') })
    })
  })

  test('with fallbackValue', () => {
    const parseLiteral = withDefault(equals('#FF0000'), '#00FF00')
    expect(parseLiteral('#XXYYZZ')).toEqual({
      tag: 'success',
      value: '#00FF00',
    })
  })
})
