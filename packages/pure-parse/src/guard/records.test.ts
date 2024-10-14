import { describe, expect, it, test } from 'vitest'
import { partialRecordGuard, recordGuard } from './records'
import { isBoolean, isNumber, isString } from './primitives'
import { Guard } from './types'
import { literalGuard } from './literal'
import { objectGuard } from './object'
import { unionGuard } from './union'
import { arrayGuard } from './arrays'
import { optionalGuard } from './optional'

describe('partial records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      partialRecordGuard(isString, isString) satisfies Guard<
        Partial<Record<string, string>>
      >
      partialRecordGuard(isString, isNumber) satisfies Guard<
        Partial<Record<string, number>>
      >
      // @ts-expect-error
      partialRecordGuard(isString, isString) satisfies Guard<
        Partial<Record<string, number>>
      >
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {
        partialRecordGuard<string, string>(isString, isString)
        partialRecordGuard<string, number[]>(isString, arrayGuard(isNumber))
        // @ts-expect-error
        partialRecordGuard<string, string>(isString, isNumber)
        // @ts-expect-error
        partialRecordGuard<string, number[]>(isString, arrayGuard(isString))
      })
      test('literal union as key', () => {
        partialRecordGuard<'a', string>(literalGuard('a'), isString)
        // @ts-expect-error
        partialRecordGuard<'a', string>(isString, isString)
        // @ts-expect-error
        partialRecordGuard<'a', string>(literalGuard('b'), isString)
      })
    })
  })
  it('validates null', () => {
    expect(partialRecordGuard(isString, isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(partialRecordGuard(isString, isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(partialRecordGuard(isString, isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(partialRecordGuard(isString, isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(partialRecordGuard(isString, isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(
      partialRecordGuard(isString, isString)({ a: 'hello', b: 'hello2' }),
    ).toEqual(true)
    expect(partialRecordGuard(isString, isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(
      partialRecordGuard(isString, isBoolean)({ a: true, b: false }),
    ).toEqual(true)
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(
      partialRecordGuard(isString, isString)({ a: 'hello', b: 1 }),
    ).toEqual(false)
    expect(
      partialRecordGuard(isString, isNumber)({ a: 'hello', b: 1 }),
    ).toEqual(false)
    expect(
      partialRecordGuard(isString, isBoolean)({ a: 'hello', b: true }),
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
        partialRecordGuard(isString, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecordGuard(isString, isString)({})).toEqual(true)
    })
    it('does not allow extra keys', () => {
      const isKey = unionGuard(literalGuard('a'), literalGuard('b'))
      expect(
        partialRecordGuard(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        partialRecordGuard(
          isKey,
          isString,
        )({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('allows each key to be omitted', () => {
      const isKey = unionGuard(literalGuard('a'), literalGuard('b'))
      expect(
        partialRecordGuard(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecordGuard(isKey, isString)({ a: 'hello' })).toEqual(true)
      expect(partialRecordGuard(isKey, isString)({})).toEqual(true)
    })
  })
})
describe('records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      const keys = ['a', 'b', 'c'] as const
      recordGuard(keys, isString) satisfies Guard<Record<string, string>>
      recordGuard(keys, isNumber) satisfies Guard<Record<string, number>>
      // @ts-expect-error
      recordGuard(keys, isString) satisfies Guard<Record<string, number>>
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {})
      test('literal union as key', () => {
        recordGuard<['a', 'b'], string>(['a', 'b'], isString)
        recordGuard<['a', 'b'], number[]>(['a', 'b'], arrayGuard(isNumber))
        // @ts-expect-error
        recordGuard<['a', 'b'], string>(['a', 'b'], isNumber)
        // @ts-expect-error
        recordGuard<['a', 'b'], number[]>(['a', 'b'], arrayGuard(isString))
      })
    })
  })
  it('validates null', () => {
    expect(recordGuard([], isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(recordGuard([], isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(recordGuard([], isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(recordGuard([], isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(recordGuard([], isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(
      recordGuard(['a', 'b'], isString)({ a: 'hello', b: 'hello2' }),
    ).toEqual(true)
    expect(recordGuard(['a', 'b'], isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(recordGuard(['a', 'b'], isBoolean)({ a: true, b: false })).toEqual(
      true,
    )
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(recordGuard(['a', 'b'], isString)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(recordGuard(['a', 'b'], isNumber)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(recordGuard(['a', 'b'], isBoolean)({ a: 'hello', b: true })).toEqual(
      false,
    )
  })
  describe('keys', () => {
    it('allows keys to be of type string', () => {
      expect(
        recordGuard(['a', 'b'], isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
    })
    it('requires all keys to be present', () => {
      expect(
        recordGuard(['a', 'b'], isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(recordGuard(['a', 'b'], isString)({ a: 'hello' })).toEqual(false)
      expect(recordGuard(['a', 'b'], isString)({ b: 'hello2' })).toEqual(false)
    })
    it('does not allow extra keys', () => {
      expect(
        recordGuard(['a', 'b'], isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        recordGuard(
          ['a', 'b'],
          isString,
        )({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('handles optional keys', () => {
      expect(
        recordGuard(
          ['a', 'b'],
          optionalGuard(isString),
        )({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        recordGuard(['a', 'b'], optionalGuard(isString))({ a: 'hello' }),
      ).toEqual(true)
      expect(recordGuard(['a', 'b'], optionalGuard(isString))({})).toEqual(true)
    })
  })
})
