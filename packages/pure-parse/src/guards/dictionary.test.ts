import { describe, expect, it, test } from 'vitest'
import { isBoolean, isNumber, isString } from './primitives'
import { Guard } from './types'
import { equalsGuard } from './equals'
import { objectGuard } from './object'
import { oneOfGuard } from './oneOf'
import { arrayGuard } from './arrays'
import { Equals } from '../internals'
import { Infer } from '../common'
import { dictionaryGuard } from './dictionary'

describe('dictionaries', () => {
  describe('type checking', () => {
    it('returns a non-optional record when the key is `string`', () => {
      const guard = dictionaryGuard(isString, isString) satisfies Guard<
        Record<string, string>
      >
      const t1: Equals<Infer<typeof guard>, Record<string, string>> = true
    })
    it('returns a partial record when the key is a union of string literals', () => {
      const guard = dictionaryGuard(
        oneOfGuard(equalsGuard('a'), equalsGuard('b')),
        isString,
      )
      const t1: Equals<
        Infer<typeof guard>,
        Partial<Record<'a' | 'b', string>>
      > = true
    })
    it('returns a guard', () => {
      dictionaryGuard(isString, isString) satisfies Guard<
        Partial<Record<string, string>>
      >
      dictionaryGuard(isString, isNumber) satisfies Guard<
        Partial<Record<string, number>>
      >
      // @ts-expect-error
      dictionaryGuard(isString, isString) satisfies Guard<
        Partial<Record<string, number>>
      >
    })
    describe('type inference', () => {
      it('infers non-partial record when key is string', () => {
        const guard = dictionaryGuard(isString, isNumber)
        const t0: Equals<Infer<typeof guard>, Record<string, number>> = true
      })
      it('infers partial record when key is union of string literals', () => {
        const guard = dictionaryGuard(
          oneOfGuard(equalsGuard('a'), equalsGuard('b')),
          isString,
        )
        const t0: Equals<
          Infer<typeof guard>,
          Partial<Record<'a' | 'b', string>>
        > = true
      })
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {
        dictionaryGuard<string, string>(isString, isString)
        dictionaryGuard<string, number[]>(isString, arrayGuard(isNumber))
        // @ts-expect-error
        dictionaryGuard<string, string>(isString, isNumber)
        // @ts-expect-error
        dictionaryGuard<string, number[]>(isString, arrayGuard(isString))
      })
      test('literal union as key', () => {
        dictionaryGuard<'a', string>(equalsGuard('a'), isString)
        // @ts-expect-error
        dictionaryGuard<'a', string>(isString, isString)
        // @ts-expect-error
        dictionaryGuard<'a', string>(equalsGuard('b'), isString)
      })
    })
  })
  it('validates null', () => {
    expect(dictionaryGuard(isString, isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(dictionaryGuard(isString, isString)(undefined)).toEqual(false)
  })
  it('validates empty objects', () => {
    expect(dictionaryGuard(isString, isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(dictionaryGuard(isString, isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(dictionaryGuard(isString, isString)(['a'])).toEqual(false)
  })
  it('validates objects where the type of the keys match', () => {
    expect(
      dictionaryGuard(isString, isString)({ a: 'hello', b: 'hello2' }),
    ).toEqual(true)
    expect(dictionaryGuard(isString, isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(dictionaryGuard(isString, isBoolean)({ a: true, b: false })).toEqual(
      true,
    )
  })
  it('invalidates objects where the type of any key does not match', () => {
    expect(dictionaryGuard(isString, isString)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(dictionaryGuard(isString, isNumber)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(
      dictionaryGuard(isString, isBoolean)({ a: 'hello', b: true }),
    ).toEqual(false)
  })
  test('extra properties in the schema', () => {
    const isObj = objectGuard({
      a: isNumber,
      // @ts-expect-error - all properties must be guard functions
      b: 123,
    })
  })
  describe('keys', () => {
    it('allows keys to be of type string', () => {
      expect(
        dictionaryGuard(isString, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(dictionaryGuard(isString, isString)({})).toEqual(true)
    })
    it('does not allow extra keys', () => {
      const isKey = oneOfGuard(equalsGuard('a'), equalsGuard('b'))
      expect(
        dictionaryGuard(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        dictionaryGuard(
          isKey,
          isString,
        )({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('allows each key to be omitted', () => {
      const isKey = oneOfGuard(equalsGuard('a'), equalsGuard('b'))
      expect(
        dictionaryGuard(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(dictionaryGuard(isKey, isString)({ a: 'hello' })).toEqual(true)
      expect(dictionaryGuard(isKey, isString)({})).toEqual(true)
    })
  })
})
