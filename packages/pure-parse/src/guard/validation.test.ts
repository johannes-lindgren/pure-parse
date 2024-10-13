import { describe, it, expect, test } from 'vitest'
import {
  arrayGuard,
  partialRecord,
  optional,
  nullable,
  optionalNullable,
  record,
  undefineable,
} from './validation'
import { Equals } from '../internals'
import {
  isBoolean,
  isNull,
  isNumber,
  isString,
  isUndefined,
  isUnknown,
} from './primitives'
import { Infer } from '../common'
import { Guard } from './types'
import { literal } from './literal'
import { union } from './union'
import { tuple } from './tuple'
import { objectGuard, objectGuardNoJit } from './object'

describe('sum types', () => {
  describe('generic property guards', () => {
    it('allows for generic, higher-order validation function', () => {
      type TreeNode<T> = {
        data: T
      }

      const isTreeNode = <T>(
        isData: (data: unknown) => data is T,
      ): Guard<TreeNode<T>> =>
        objectGuard({
          // In v0.0.0-beta.3, this caused a problem with optional properties.
          // Because data can be undefined, it got interpreted as an optional property, which clashed with the
          // definition of `TreeNode` which declares it as required.
          data: isData,
        })
    })
  })
  describe('optional', () => {
    it('matches undefined', () => {
      expect(optional(isString)(undefined)).toEqual(true)
    })
    it('mismatches undefined', () => {
      expect(optional(isString)(null)).toEqual(false)
    })
    it('matches the guard type of the guard argument', () => {
      expect(optional(isBoolean)(true)).toEqual(true)
      expect(optional(isNumber)(123)).toEqual(true)
      expect(optional(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(optional(isBoolean)(123)).toEqual(false)
      expect(optional(isNumber)('hello')).toEqual(false)
      expect(optional(isString)(true)).toEqual(false)
    })
    it('represent optional properties', () => {
      const isObj = objectGuard({
        a: optional(isString),
      })
      expect(isObj({ a: 'hello' })).toEqual(true)
      expect(isObj({ a: undefined })).toEqual(true)
      expect(isObj({})).toEqual(true)
    })
    test('type inference', () => {
      const isObj = objectGuard({
        id: isNumber,
        name: optional(isString),
      })
      type User = {
        id: number
        name?: string
      }
      type InferredUser = Infer<typeof isObj>
      // @ts-expect-error -- TODO can't get this to work
      const t1: Equals<User, InferredUser> = true
      const t2: InferredUser = {
        id: 0,
        name: 'Johannes',
      }
      // @ts-expect-error -- TODO can't get this to work
      const t3: InferredUser = {
        id: 0,
      }
      const t4: InferredUser = {
        id: 0,
        name: undefined,
      }
    })
  })
  describe('nullable', () => {
    it('matches undefined', () => {
      expect(nullable(isString)(undefined)).toEqual(false)
    })
    it('mismatches undefined', () => {
      expect(nullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(true)).toEqual(true)
      expect(nullable(isNumber)(123)).toEqual(true)
      expect(nullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(123)).toEqual(false)
      expect(nullable(isNumber)('hello')).toEqual(false)
      expect(nullable(isString)(true)).toEqual(false)
    })
  })
  describe('optionalNullable', () => {
    it('matches undefined', () => {
      expect(optionalNullable(isString)(undefined)).toEqual(true)
    })
    it('mismatches undefined', () => {
      expect(optionalNullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(optionalNullable(isBoolean)(true)).toEqual(true)
      expect(optionalNullable(isNumber)(123)).toEqual(true)
      expect(optionalNullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(optionalNullable(isBoolean)(123)).toEqual(false)
      expect(optionalNullable(isNumber)('hello')).toEqual(false)
      expect(optionalNullable(isString)(true)).toEqual(false)
    })
    it('represent optional properties', () => {
      const isObj = objectGuard({
        a: optionalNullable(isString),
      })
      expect(isObj({ a: 'hello' })).toEqual(true)
      expect(isObj({ a: undefined })).toEqual(true)
      expect(isObj({ a: null })).toEqual(true)
      expect(isObj({})).toEqual(true)
    })
  })
  describe('nullable', () => {
    it('mismatches undefined', () => {
      expect(nullable(isString)(undefined)).toEqual(false)
    })
    it('matches null', () => {
      expect(nullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(true)).toEqual(true)
      expect(nullable(isNumber)(123)).toEqual(true)
      expect(nullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(123)).toEqual(false)
      expect(nullable(isNumber)('hello')).toEqual(false)
      expect(nullable(isString)(true)).toEqual(false)
    })
  })
  describe('undefinable', () => {
    it('matches undefined', () => {
      expect(undefineable(isString)(undefined)).toEqual(true)
    })
    it('mismatches null', () => {
      expect(undefineable(isString)(null)).toEqual(false)
    })
    it('matches the guard type of the guard argument', () => {
      expect(undefineable(isBoolean)(true)).toEqual(true)
      expect(undefineable(isNumber)(123)).toEqual(true)
      expect(undefineable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(undefineable(isBoolean)(123)).toEqual(false)
      expect(undefineable(isNumber)('hello')).toEqual(false)
      expect(undefineable(isString)(true)).toEqual(false)
    })
  })
})

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
describe('recursive types', () => {
  describe('isArray', () => {
    describe('types', () => {
      it('returns a guard', () => {
        arrayGuard(isString) satisfies Guard<string[]>
        // @ts-expect-error
        arrayGuard(isString) satisfies Guard<number[]>
      })
      it('infers the exact type', () => {
        // Number
        const isNumberArray = arrayGuard((d): d is number => true)
        type NumberArray = Infer<typeof isNumberArray>
        const assertionNumber1: Equals<NumberArray, number[]> = true
        const assertionNumber2: Equals<NumberArray, unknown[]> = false
        // String
        const isStringArray = arrayGuard(isString)
        type StringArray = Infer<typeof isStringArray>
        const assertionString1: Equals<StringArray, string[]> = true
        const assertionString2: Equals<StringArray, unknown[]> = false
      })
      test('explicit generic type annotation', () => {
        arrayGuard<number>(isNumber)
        arrayGuard<string>(isString)
        arrayGuard<string | number>(union(isString, isNumber))
        // @ts-expect-error
        arrayGuard<number>(union(isString, isNumber))
        // @ts-expect-error
        arrayGuard<string>(isNumber)
        // @ts-expect-error
        arrayGuard<string[]>(isString)
        // @ts-expect-error
        arrayGuard<string>(arrayGuard(isNumber))
      })
    })
    it('validates null', () => {
      expect(arrayGuard(isUnknown)(null)).toEqual(false)
    })
    it('validates undefined', () => {
      expect(arrayGuard(isUnknown)(undefined)).toEqual(false)
    })
    it('validates unassigned values', () => {
      let data
      expect(arrayGuard(isUnknown)(data)).toEqual(false)
    })
    it('validates booleans', () => {
      expect(arrayGuard(isUnknown)(false)).toEqual(false)
      expect(arrayGuard(isUnknown)(true)).toEqual(false)
    })
    it('validates numbers', () => {
      expect(arrayGuard(isUnknown)(NaN)).toEqual(false)
      expect(arrayGuard(isUnknown)(Infinity)).toEqual(false)
      expect(arrayGuard(isUnknown)(0)).toEqual(false)
      expect(arrayGuard(isUnknown)(1)).toEqual(false)
      expect(arrayGuard(isUnknown)(3.14159)).toEqual(false)
    })
    it('validates strings', () => {
      expect(arrayGuard(isUnknown)('')).toEqual(false)
      expect(arrayGuard(isUnknown)('hello')).toEqual(false)
    })
    it('validates symbols', () => {
      expect(arrayGuard(isUnknown)(Symbol())).toEqual(false)
    })
    it('validates objects', () => {
      expect(arrayGuard(isUnknown)({})).toEqual(false)
    })
    it('validates empty arrays', () => {
      expect(arrayGuard(isUnknown)([])).toEqual(true)
    })
    it('always validates empty arrays', () => {
      expect(arrayGuard(isUnknown)([])).toEqual(true)
      expect(arrayGuard(isString)([])).toEqual(true)
      expect(arrayGuard(isBoolean)([])).toEqual(true)
      expect(arrayGuard((data: unknown): data is unknown => false)([])).toEqual(
        true,
      )
    })
    it('expects every element to pass the validation', () => {
      expect(arrayGuard(union(isNumber))([1, 2, 3, 4])).toEqual(true)
      expect(arrayGuard(union(isNumber))([1, 2, 3, 'a', 4])).toEqual(false)
      expect(
        arrayGuard(union(isString, isNumber, isBoolean))([1, 'a', false]),
      ).toEqual(true)
    })
  })
})
