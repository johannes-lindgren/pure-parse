import { describe, expect, it, test } from 'vitest'
import { partialRecord, record } from './records'
import { isBoolean, isNumber, isString } from './primitives'
import { Guard } from './types'
import { literal } from './literal'
import { objectGuard } from './object'
import { union } from './union'
import { arrayGuard } from './arrays'
import { optional } from './optional'

describe('partial records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      partialRecord(isString, isString) satisfies Guard<
        Partial<Record<string, string>>
      >
      partialRecord(isString, isNumber) satisfies Guard<
        Partial<Record<string, number>>
      >
      // @ts-expect-error
      partialRecord(isString, isString) satisfies Guard<
        Partial<Record<string, number>>
      >
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {
        partialRecord<string, string>(isString, isString)
        partialRecord<string, number[]>(isString, arrayGuard(isNumber))
        // @ts-expect-error
        partialRecord<string, string>(isString, isNumber)
        // @ts-expect-error
        partialRecord<string, number[]>(isString, arrayGuard(isString))
      })
      test('literal union as key', () => {
        partialRecord<'a', string>(literal('a'), isString)
        // @ts-expect-error
        partialRecord<'a', string>(isString, isString)
        // @ts-expect-error
        partialRecord<'a', string>(literal('b'), isString)
      })
    })
  })
  it('validates null', () => {
    expect(partialRecord(isString, isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(partialRecord(isString, isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(partialRecord(isString, isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(partialRecord(isString, isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(partialRecord(isString, isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(
      partialRecord(isString, isString)({ a: 'hello', b: 'hello2' }),
    ).toEqual(true)
    expect(partialRecord(isString, isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(partialRecord(isString, isBoolean)({ a: true, b: false })).toEqual(
      true,
    )
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(partialRecord(isString, isString)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(partialRecord(isString, isNumber)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(partialRecord(isString, isBoolean)({ a: 'hello', b: true })).toEqual(
      false,
    )
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
        partialRecord(isString, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecord(isString, isString)({})).toEqual(true)
    })
    it('does not allow extra keys', () => {
      const isKey = union(literal('a'), literal('b'))
      expect(
        partialRecord(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        partialRecord(
          isKey,
          isString,
        )({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('allows each key to be omitted', () => {
      const isKey = union(literal('a'), literal('b'))
      expect(
        partialRecord(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecord(isKey, isString)({ a: 'hello' })).toEqual(true)
      expect(partialRecord(isKey, isString)({})).toEqual(true)
    })
  })
})
describe('records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      const keys = ['a', 'b', 'c'] as const
      record(keys, isString) satisfies Guard<Record<string, string>>
      record(keys, isNumber) satisfies Guard<Record<string, number>>
      // @ts-expect-error
      record(keys, isString) satisfies Guard<Record<string, number>>
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {})
      test('literal union as key', () => {
        record<['a', 'b'], string>(['a', 'b'], isString)
        record<['a', 'b'], number[]>(['a', 'b'], arrayGuard(isNumber))
        // @ts-expect-error
        record<['a', 'b'], string>(['a', 'b'], isNumber)
        // @ts-expect-error
        record<['a', 'b'], number[]>(['a', 'b'], arrayGuard(isString))
      })
    })
  })
  it('validates null', () => {
    expect(record([], isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(record([], isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(record([], isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(record([], isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(record([], isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
      true,
    )
    expect(record(['a', 'b'], isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(record(['a', 'b'], isBoolean)({ a: true, b: false })).toEqual(true)
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(record(['a', 'b'], isString)({ a: 'hello', b: 1 })).toEqual(false)
    expect(record(['a', 'b'], isNumber)({ a: 'hello', b: 1 })).toEqual(false)
    expect(record(['a', 'b'], isBoolean)({ a: 'hello', b: true })).toEqual(
      false,
    )
  })
  describe('keys', () => {
    it('allows keys to be of type string', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
    })
    it('requires all keys to be present', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
      expect(record(['a', 'b'], isString)({ a: 'hello' })).toEqual(false)
      expect(record(['a', 'b'], isString)({ b: 'hello2' })).toEqual(false)
    })
    it('does not allow extra keys', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
      expect(
        record(['a', 'b'], isString)({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('handles optional keys', () => {
      expect(
        record(['a', 'b'], optional(isString))({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(record(['a', 'b'], optional(isString))({ a: 'hello' })).toEqual(
        true,
      )
      expect(record(['a', 'b'], optional(isString))({})).toEqual(true)
    })
  })
})
