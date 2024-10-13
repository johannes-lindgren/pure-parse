import { describe, expect, it } from 'vitest'
import { union } from './union'
import { literal } from './literal'
import { Guard } from './types'
import { isNull, isNumber, isString, isUndefined } from './primitives'

describe('unions', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      union(literal('red'), literal('green'), literal('blue')) satisfies Guard<
        'red' | 'green' | 'blue'
      >
      union(isString, isUndefined) satisfies Guard<string | undefined>
      union(isString, isNumber) satisfies Guard<string | number>
      union(isString) satisfies Guard<string>

      union(
        literal('red'),
        literal('green'),
        literal('blue'),
        // @ts-expect-error
      ) satisfies Guard<'a' | 'b' | 'c'>
      union(
        literal('red'),
        literal('green'),
        literal('blue'),
        // @ts-expect-error
      ) satisfies Guard<'red'>
      // @ts-expect-error
      union(isString, isUndefined) satisfies Guard<string>
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        union<['red', 'green', 'blue']>(
          literal('red'),
          literal('green'),
          literal('blue'),
        )
        union<['red', 'green', 'blue']>(
          // @ts-expect-error
          literal('a'),
          literal('b'),
          literal('c'),
        )
      })
      it('requires a guard of each type', () => {
        union<[string, undefined]>(isString, isUndefined)
        // @ts-expect-error
        union<[string, undefined]>(isUndefined)
        // @ts-expect-error
        union<[string, undefined]>(isString)
      })
      it('allows nested guards', () => {
        union<[string, number, undefined | null]>(
          isString,
          isNumber,
          union(isUndefined, isNull),
        )
      })
      it('handles primitive types', () => {
        union<[string, undefined]>(isString, isUndefined)
        union<[string, number]>(isString, isNumber)
        // @ts-expect-error
        union<[string, undefined]>(union(isString))
        // @ts-expect-error
        union<string>(union(isString, isUndefined))
      })
    })
  })
  it('does not match anything when the array is empty', () => {
    const isUnion = union()
    expect(isUnion('a')).toEqual(false)
    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(null)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
  it('matches any of the the guards in the array', () => {
    const isUnion = union(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)
  })
  it('only matches the guards in the array', () => {
    const isUnion = union(isString, isNumber, isNull)
    expect(isUnion('a')).toEqual(true)
    expect(isUnion(123)).toEqual(true)
    expect(isUnion(null)).toEqual(true)

    expect(isUnion(true)).toEqual(false)
    expect(isUnion(false)).toEqual(false)
    expect(isUnion(undefined)).toEqual(false)
  })
})
