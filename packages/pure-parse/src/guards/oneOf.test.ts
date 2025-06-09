import { describe, expect, it } from 'vitest'
import { oneOfGuard } from './oneOf'
import { equalsGuard } from './equals'
import { Guard } from './Guard'
import { isNull, isNumber, isString, isUndefined } from './primitives'

describe('unions', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      oneOfGuard(
        equalsGuard('red'),
        equalsGuard('green'),
        equalsGuard('blue'),
      ) satisfies Guard<'red' | 'green' | 'blue'>
      oneOfGuard(isString, isUndefined) satisfies Guard<string | undefined>
      oneOfGuard(isString, isNumber) satisfies Guard<string | number>
      oneOfGuard(isString) satisfies Guard<string>

      oneOfGuard(
        equalsGuard('red'),
        equalsGuard('green'),
        equalsGuard('blue'),
        // @ts-expect-error
      ) satisfies Guard<'a' | 'b' | 'c'>
      oneOfGuard(
        equalsGuard('red'),
        equalsGuard('green'),
        equalsGuard('blue'),
        // @ts-expect-error
      ) satisfies Guard<'red'>
      // @ts-expect-error
      oneOfGuard(isString, isUndefined) satisfies Guard<string>
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        oneOfGuard<['red', 'green', 'blue']>(
          equalsGuard('red'),
          equalsGuard('green'),
          equalsGuard('blue'),
        )
        oneOfGuard<['red', 'green', 'blue']>(
          // @ts-expect-error
          equalsGuard('a'),
          equalsGuard('b'),
          equalsGuard('c'),
        )
      })
      it('requires a guard of each type', () => {
        oneOfGuard<[string, undefined]>(isString, isUndefined)
        // @ts-expect-error
        oneOfGuard<[string, undefined]>(isUndefined)
        // @ts-expect-error
        oneOfGuard<[string, undefined]>(isString)
      })
      it('allows nested guards', () => {
        oneOfGuard<[string, number, undefined | null]>(
          isString,
          isNumber,
          oneOfGuard(isUndefined, isNull),
        )
      })
      it('handles primitive types', () => {
        oneOfGuard<[string, undefined]>(isString, isUndefined)
        oneOfGuard<[string, number]>(isString, isNumber)
        // @ts-expect-error
        oneOfGuard<[string, undefined]>(oneOfGuard(isString))
        // @ts-expect-error
        oneOfGuard<string>(oneOfGuard(isString, isUndefined))
      })
    })
  })
  it('does not match anything when the array is empty', () => {
    const isUnion = oneOfGuard()
    expect(isUnion('a')).toEqual(false)
    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(null)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
  it('matches any of the the guards in the array', () => {
    const isUnion = oneOfGuard(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)
  })
  it('only matches the guards in the array', () => {
    const isUnion = oneOfGuard(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)

    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
})
