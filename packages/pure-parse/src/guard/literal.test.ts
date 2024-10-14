import { describe, expect, it, test } from 'vitest'
import { literal } from './literal'
import { Guard } from './types'

describe('literal types', () => {
  describe('type checking', () => {
    describe('type inference', () => {
      it('works with literals', () => {
        const symb = Symbol()
        literal(symb) satisfies Guard<typeof symb>
        literal('red') satisfies Guard<'red'>
        // @ts-expect-error
        literal('red') satisfies Guard<'green'>
        literal(1) satisfies Guard<1>
        // @ts-expect-error
        literal(1) satisfies Guard<2>
      })
      it('forbids non-literals', () => {
        // @ts-expect-error
        literal([])
        // @ts-expect-error
        literal({})
      })
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        literal<['red']>('red')
        // @ts-expect-error
        literal<['green']>('red')

        literal<[1]>(1)
        // @ts-expect-error
        literal<[1]>(2)

        // @ts-expect-error
        literal<['1']>(1)
      })
    })
  })
  describe('unions of literals', () => {
    it('validates unions of literals correctly', () => {
      const isColor = literal('red', 'green', 'blue')
      expect(isColor('red')).toEqual(true)
      expect(isColor('green')).toEqual(true)
      expect(isColor('blue')).toEqual(true)
      expect(isColor('music')).toEqual(false)

      const isInUnion = literal('red', 1, true)
      expect(isInUnion('red')).toEqual(true)
      expect(isInUnion('green')).toEqual(false)
      expect(isInUnion(1)).toEqual(true)
      expect(isInUnion(2)).toEqual(false)
      expect(isInUnion(true)).toEqual(true)
      expect(isInUnion(false)).toEqual(false)
    })
    it('infers the types of unions of literals', () => {
      literal('red', 1, true) satisfies Guard<'red' | 1 | true>
      literal('red', 'green', 'blue') satisfies Guard<'red' | 'green' | 'blue'>
      // @ts-expect-error
      literal('red', 'green', 'blue') satisfies Guard<'red'>
    })
    test('explicit type annotation', () => {
      literal<['red', 'green', 'blue']>('red', 'green', 'blue')
      // @ts-expect-error
      literal<['red', 'green', 'blue']>('red')
      // @ts-expect-error
      literal<['red', 'green', 'blue']>('red', 'green', 'blue', 'music')
    })
  })
  describe('literal', () => {
    it('matches null', () => {
      expect(literal(null)(null)).toEqual(true)
    })
    it('matches undefined', () => {
      expect(literal(undefined)(undefined)).toEqual(true)
    })
    it('matches strings', () => {
      expect(literal('')('')).toEqual(true)
      expect(literal('a')('a')).toEqual(true)
      expect(literal('abc')('123')).toEqual(false)
    })
    it('matches numbers', () => {
      expect(literal(-1)(-1)).toEqual(true)
      expect(literal(0)(0)).toEqual(true)
      expect(literal(1)(1)).toEqual(true)

      expect(literal(123)('123')).toEqual(false)
    })
    it('matches booleans', () => {
      expect(literal(true)(true)).toEqual(true)
      expect(literal(false)(false)).toEqual(true)
      expect(literal(true)(false)).toEqual(false)
      expect(literal(false)(true)).toEqual(false)
    })
  })
})
