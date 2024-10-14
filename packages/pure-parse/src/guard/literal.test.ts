import { describe, expect, it, test } from 'vitest'
import { literalGuard } from './literal'
import { Guard } from './types'

describe('literal types', () => {
  describe('type checking', () => {
    describe('type inference', () => {
      it('works with literals', () => {
        const symb = Symbol()
        literalGuard(symb) satisfies Guard<typeof symb>
        literalGuard('red') satisfies Guard<'red'>
        // @ts-expect-error
        literalGuard('red') satisfies Guard<'green'>
        literalGuard(1) satisfies Guard<1>
        // @ts-expect-error
        literalGuard(1) satisfies Guard<2>
      })
      it('forbids non-literals', () => {
        // @ts-expect-error
        literalGuard([])
        // @ts-expect-error
        literalGuard({})
      })
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        literalGuard<['red']>('red')
        // @ts-expect-error
        literalGuard<['green']>('red')

        literalGuard<[1]>(1)
        // @ts-expect-error
        literalGuard<[1]>(2)

        // @ts-expect-error
        literalGuard<['1']>(1)
      })
    })
  })
  describe('unions of literals', () => {
    it('validates unions of literals correctly', () => {
      const isColor = literalGuard('red', 'green', 'blue')
      expect(isColor('red')).toEqual(true)
      expect(isColor('green')).toEqual(true)
      expect(isColor('blue')).toEqual(true)
      expect(isColor('music')).toEqual(false)

      const isInUnion = literalGuard('red', 1, true)
      expect(isInUnion('red')).toEqual(true)
      expect(isInUnion('green')).toEqual(false)
      expect(isInUnion(1)).toEqual(true)
      expect(isInUnion(2)).toEqual(false)
      expect(isInUnion(true)).toEqual(true)
      expect(isInUnion(false)).toEqual(false)
    })
    it('infers the types of unions of literals', () => {
      literalGuard('red', 1, true) satisfies Guard<'red' | 1 | true>
      literalGuard('red', 'green', 'blue') satisfies Guard<
        'red' | 'green' | 'blue'
      >
      // @ts-expect-error
      literalGuard('red', 'green', 'blue') satisfies Guard<'red'>
    })
    test('explicit type annotation', () => {
      literalGuard<['red', 'green', 'blue']>('red', 'green', 'blue')
      // @ts-expect-error
      literalGuard<['red', 'green', 'blue']>('red')
      // @ts-expect-error
      literalGuard<['red', 'green', 'blue']>('red', 'green', 'blue', 'music')
    })
  })
  describe('literal', () => {
    it('matches null', () => {
      expect(literalGuard(null)(null)).toEqual(true)
    })
    it('matches undefined', () => {
      expect(literalGuard(undefined)(undefined)).toEqual(true)
    })
    it('matches strings', () => {
      expect(literalGuard('')('')).toEqual(true)
      expect(literalGuard('a')('a')).toEqual(true)
      expect(literalGuard('abc')('123')).toEqual(false)
    })
    it('matches numbers', () => {
      expect(literalGuard(-1)(-1)).toEqual(true)
      expect(literalGuard(0)(0)).toEqual(true)
      expect(literalGuard(1)(1)).toEqual(true)

      expect(literalGuard(123)('123')).toEqual(false)
    })
    it('matches booleans', () => {
      expect(literalGuard(true)(true)).toEqual(true)
      expect(literalGuard(false)(false)).toEqual(true)
      expect(literalGuard(true)(false)).toEqual(false)
      expect(literalGuard(false)(true)).toEqual(false)
    })
  })
})
