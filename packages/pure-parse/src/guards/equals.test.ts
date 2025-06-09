import { describe, expect, it, test } from 'vitest'
import { equalsGuard } from './equals'
import { Guard } from './Guard'
import { isString } from './primitives'

describe('equals', () => {
  describe('type checking', () => {
    describe('type inference', () => {
      it('works with literals', () => {
        const symb = Symbol()
        equalsGuard(symb) satisfies Guard<typeof symb>
        equalsGuard('red') satisfies Guard<'red'>
        // @ts-expect-error
        equalsGuard('red') satisfies Guard<'green'>
        equalsGuard(1) satisfies Guard<1>
        // @ts-expect-error
        equalsGuard(1) satisfies Guard<2>
      })
      it('forbids non-literals', () => {
        // @ts-expect-error
        equalsGuard([])
        // @ts-expect-error
        equalsGuard({})
      })
    })
    describe('explicit generic type annotation', () => {
      it('works with primitives', () => {
        equalsGuard<'red'>('red')
        // @ts-expect-error
        equalsGuard<'green'>('red')

        equalsGuard<1>(1)
        // @ts-expect-error
        equalsGuard<1>(2)

        // @ts-expect-error
        equalsGuard<'1'>(1)
      })
      it('does not work with reference types', () => {
        // @ts-expect-error
        equalsGuard<{ a: 'b' }>({ a: equalsGuard('b') })
      })
    })
  })
  describe('primitive arguments', () => {
    it('matches null', () => {
      expect(equalsGuard(null)(null)).toEqual(true)
      expect(equalsGuard(null)('null')).toEqual(false)
      expect(equalsGuard(null)(undefined)).toEqual(false)
    })
    it('matches undefined', () => {
      expect(equalsGuard(undefined)(undefined)).toEqual(true)
      expect(equalsGuard(undefined)(null)).toEqual(false)
    })
    it('matches strings', () => {
      expect(equalsGuard('')('')).toEqual(true)
      expect(equalsGuard('')('a')).toEqual(false)
      expect(equalsGuard('a')('a')).toEqual(true)
      expect(equalsGuard('a')('b')).toEqual(false)
      expect(equalsGuard('abc')('abc')).toEqual(true)
      expect(equalsGuard('abc')('123')).toEqual(false)
    })
    it('matches numbers', () => {
      expect(equalsGuard(-1)(-1)).toEqual(true)
      expect(equalsGuard(0)(0)).toEqual(true)
      expect(equalsGuard(1)(1)).toEqual(true)

      expect(equalsGuard(123)('123')).toEqual(false)
      expect(equalsGuard(123)(0)).toEqual(false)
    })
    it('matches booleans', () => {
      expect(equalsGuard(true)(true)).toEqual(true)
      expect(equalsGuard(false)(false)).toEqual(true)
      expect(equalsGuard(true)(false)).toEqual(false)
      expect(equalsGuard(false)(true)).toEqual(false)
    })
    it('matches symbols', () => {
      const symbol1 = Symbol()
      const symbol2 = Symbol()
      expect(equalsGuard(symbol1)(symbol1)).toEqual(true)
      expect(equalsGuard(symbol1)(symbol2)).toEqual(false)
      expect(equalsGuard(symbol1)(Symbol())).toEqual(false)
    })
    it('matches bigints', () => {
      expect(equalsGuard(1n)(1n)).toEqual(true)
      expect(equalsGuard(1n)(2n)).toEqual(false)
      expect(equalsGuard(1n)(1)).toEqual(false)
    })
  })
})
