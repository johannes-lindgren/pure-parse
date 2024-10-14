import { describe, expect, it } from 'vitest'
import { unionGuard } from './union'
import { literalGuard } from './literal'
import { Guard } from './types'
import { isNull, isNumber, isString, isUndefined } from './primitives'

describe('unions', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      unionGuard(
        literalGuard('red'),
        literalGuard('green'),
        literalGuard('blue'),
      ) satisfies Guard<'red' | 'green' | 'blue'>
      unionGuard(isString, isUndefined) satisfies Guard<string | undefined>
      unionGuard(isString, isNumber) satisfies Guard<string | number>
      unionGuard(isString) satisfies Guard<string>

      unionGuard(
        literalGuard('red'),
        literalGuard('green'),
        literalGuard('blue'),
        // @ts-expect-error
      ) satisfies Guard<'a' | 'b' | 'c'>
      unionGuard(
        literalGuard('red'),
        literalGuard('green'),
        literalGuard('blue'),
        // @ts-expect-error
      ) satisfies Guard<'red'>
      // @ts-expect-error
      unionGuard(isString, isUndefined) satisfies Guard<string>
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        unionGuard<['red', 'green', 'blue']>(
          literalGuard('red'),
          literalGuard('green'),
          literalGuard('blue'),
        )
        unionGuard<['red', 'green', 'blue']>(
          // @ts-expect-error
          literalGuard('a'),
          literalGuard('b'),
          literalGuard('c'),
        )
      })
      it('requires a guard of each type', () => {
        unionGuard<[string, undefined]>(isString, isUndefined)
        // @ts-expect-error
        unionGuard<[string, undefined]>(isUndefined)
        // @ts-expect-error
        unionGuard<[string, undefined]>(isString)
      })
      it('allows nested guards', () => {
        unionGuard<[string, number, undefined | null]>(
          isString,
          isNumber,
          unionGuard(isUndefined, isNull),
        )
      })
      it('handles primitive types', () => {
        unionGuard<[string, undefined]>(isString, isUndefined)
        unionGuard<[string, number]>(isString, isNumber)
        // @ts-expect-error
        unionGuard<[string, undefined]>(unionGuard(isString))
        // @ts-expect-error
        unionGuard<string>(unionGuard(isString, isUndefined))
      })
    })
  })
  it('does not match anything when the array is empty', () => {
    const isUnion = unionGuard()
    expect(isUnion('a')).toEqual(false)
    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(null)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
  it('matches any of the the guards in the array', () => {
    const isUnion = unionGuard(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)
  })
  it('only matches the guards in the array', () => {
    const isUnion = unionGuard(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)

    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
})
