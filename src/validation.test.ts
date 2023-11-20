import { describe, it, expect } from 'vitest'
import {
  array,
  isBoolean,
  isNull,
  isNumber,
  record,
  isString,
  isUndefined,
  object,
  union,
  literal,
  isSymbol,
  optional,
  tuple,
  isUnknown,
  nullable,
  optionalNullable,
} from './validation'

describe('validation', () => {
  describe('primitives', () => {
    describe('isUnknown', () => {
      it('is always true', () => {
        expect(isUnknown(null)).toEqual(true)
        expect(isUnknown(undefined)).toEqual(true)
        expect(isUnknown(false)).toEqual(true)
        expect(isUnknown(true)).toEqual(true)
        expect(isUnknown(123)).toEqual(true)
        expect(isUnknown('aaaaa')).toEqual(true)
        expect(isUnknown({})).toEqual(true)
        expect(isUnknown([])).toEqual(true)
      })
    })
    describe('isNull', () => {
      it('validates null', () => {
        expect(isNull(null)).toEqual(true)
      })
      it('validates undefined', () => {
        expect(isNull(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isNull(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isNull(false)).toEqual(false)
        expect(isNull(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isNull(NaN)).toEqual(false)
        expect(isNull(Infinity)).toEqual(false)
        expect(isNull(0)).toEqual(false)
        expect(isNull(1)).toEqual(false)
        expect(isNull(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isNull('')).toEqual(false)
        expect(isNull('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isNull(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isNull([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isNull({})).toEqual(false)
      })
    })

    describe('isUndefined', () => {
      it('validates null', () => {
        expect(isUndefined(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isUndefined(undefined)).toEqual(true)
      })
      it('validates unassigned values', () => {
        let data
        expect(isUndefined(data)).toEqual(true)
      })
      it('validates booleans', () => {
        expect(isUndefined(false)).toEqual(false)
        expect(isUndefined(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isUndefined(Infinity)).toEqual(false)
        expect(isUndefined(NaN)).toEqual(false)
        expect(isUndefined(-1)).toEqual(false)
        expect(isUndefined(0)).toEqual(false)
        expect(isUndefined(1)).toEqual(false)
        expect(isUndefined(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isUndefined('')).toEqual(false)
        expect(isUndefined('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isUndefined(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isUndefined([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isUndefined({})).toEqual(false)
      })
    })

    describe('isBoolean', () => {
      it('validates null', () => {
        expect(isBoolean(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isBoolean(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isBoolean(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isBoolean(false)).toEqual(true)
        expect(isBoolean(true)).toEqual(true)
      })
      it('validates numbers', () => {
        expect(isBoolean(Infinity)).toEqual(false)
        expect(isBoolean(NaN)).toEqual(false)
        expect(isBoolean(-1)).toEqual(false)
        expect(isBoolean(0)).toEqual(false)
        expect(isBoolean(1)).toEqual(false)
        expect(isBoolean(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isBoolean('')).toEqual(false)
        expect(isBoolean('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isBoolean(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isBoolean([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isBoolean({})).toEqual(false)
      })
    })

    describe('isNumber', () => {
      it('validates null', () => {
        expect(isNumber(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isNumber(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isNumber(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isNumber(false)).toEqual(false)
        expect(isNumber(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isNumber(Infinity)).toEqual(true)
        expect(isNumber(NaN)).toEqual(true)
        expect(isNumber(-1)).toEqual(true)
        expect(isNumber(0)).toEqual(true)
        expect(isNumber(1)).toEqual(true)
        expect(isNumber(3.14159)).toEqual(true)
      })
      it('validates strings', () => {
        expect(isNumber('')).toEqual(false)
        expect(isNumber('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isNumber(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isNumber([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isNumber({})).toEqual(false)
      })
    })

    describe('isString', () => {
      it('validates null', () => {
        expect(isString(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isString(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isString(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isString(false)).toEqual(false)
        expect(isString(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isString(NaN)).toEqual(false)
        expect(isString(Infinity)).toEqual(false)
        expect(isString(0)).toEqual(false)
        expect(isString(1)).toEqual(false)
        expect(isString(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isString('')).toEqual(true)
        expect(isString('hello')).toEqual(true)
      })
      it('validates symbols', () => {
        expect(isString(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isString([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isString({})).toEqual(false)
      })
    })

    // TODO
    describe.todo('isBigInt', () => {})

    describe('isSymbol', () => {
      it('validates null', () => {
        expect(isSymbol(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isSymbol(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isSymbol(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isSymbol(false)).toEqual(false)
        expect(isSymbol(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isSymbol(NaN)).toEqual(false)
        expect(isSymbol(Infinity)).toEqual(false)
        expect(isSymbol(0)).toEqual(false)
        expect(isSymbol(1)).toEqual(false)
        expect(isSymbol(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isSymbol('')).toEqual(false)
        expect(isSymbol('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isSymbol(Symbol())).toEqual(true)
      })
      it('validates arrays', () => {
        expect(isSymbol([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isSymbol({})).toEqual(false)
      })
    })
  })

  describe('algebraic data types', () => {
    describe('literal types', () => {
      describe('primitive', () => {
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
    describe('sum types', () => {
      describe('unions', () => {
        it('does not match anything when the array is empty', () => {
          const isUnion = union([])
          expect(isUnion('a')).toEqual(false)
          expect(isUnion(true)).toEqual(false)
          expect(isUnion(false)).toEqual(false)
          expect(isUnion(null)).toEqual(false)
          expect(isUnion(undefined)).toEqual(false)
        })
        it('matches any of the the validators in the array', () => {
          const isUnion = union([isString, isNumber, isNull])
          expect(isUnion('a')).toEqual(true)
          expect(isUnion(123)).toEqual(true)
          expect(isUnion(null)).toEqual(true)
        })
        it('only matches the validators in the array', () => {
          const isUnion = union([isString, isNumber, isNull])
          expect(isUnion('a')).toEqual(true)
          expect(isUnion(123)).toEqual(true)
          expect(isUnion(null)).toEqual(true)

          expect(isUnion(true)).toEqual(false)
          expect(isUnion(false)).toEqual(false)
          expect(isUnion(undefined)).toEqual(false)
        })
      })
      describe('optional', () => {
        it('matches undefined', () => {
          expect(optional(isString)(undefined)).toEqual(true)
        })
        it('mismatches undefined', () => {
          expect(optional(isString)(null)).toEqual(false)
        })
        it('matches the guard type of the validator argument', () => {
          expect(optional(isBoolean)(true)).toEqual(true)
          expect(optional(isNumber)(123)).toEqual(true)
          expect(optional(isString)('hello')).toEqual(true)
        })
        it('only matches the guard type of the validator argument', () => {
          expect(optional(isBoolean)(123)).toEqual(false)
          expect(optional(isNumber)('hello')).toEqual(false)
          expect(optional(isString)(true)).toEqual(false)
        })
      })
      describe('optional', () => {
        it('matches undefined', () => {
          expect(nullable(isString)(undefined)).toEqual(false)
        })
        it('mismatches undefined', () => {
          expect(nullable(isString)(null)).toEqual(true)
        })
        it('matches the guard type of the validator argument', () => {
          expect(nullable(isBoolean)(true)).toEqual(true)
          expect(nullable(isNumber)(123)).toEqual(true)
          expect(nullable(isString)('hello')).toEqual(true)
        })
        it('only matches the guard type of the validator argument', () => {
          expect(nullable(isBoolean)(123)).toEqual(false)
          expect(nullable(isNumber)('hello')).toEqual(false)
          expect(nullable(isString)(true)).toEqual(false)
        })
      })
      describe('optional', () => {
        it('matches undefined', () => {
          expect(optionalNullable(isString)(undefined)).toEqual(true)
        })
        it('mismatches undefined', () => {
          expect(optionalNullable(isString)(null)).toEqual(true)
        })
        it('matches the guard type of the validator argument', () => {
          expect(optionalNullable(isBoolean)(true)).toEqual(true)
          expect(optionalNullable(isNumber)(123)).toEqual(true)
          expect(optionalNullable(isString)('hello')).toEqual(true)
        })
        it('only matches the guard type of the validator argument', () => {
          expect(optionalNullable(isBoolean)(123)).toEqual(false)
          expect(optionalNullable(isNumber)('hello')).toEqual(false)
          expect(optionalNullable(isString)(true)).toEqual(false)
        })
      })
    })
    describe('product types', () => {
      describe('tuples', () => {
        it('validates each element', () => {
          expect(tuple([])([])).toEqual(true)
          expect(tuple([isString])(['hello'])).toEqual(true)
          expect(tuple([isString, isNumber])(['hello', 123])).toEqual(true)
          expect(
            tuple([isString, isNumber, isBoolean])(['hello', 123, false]),
          ).toEqual(true)
        })
        it('does not allow additional elements', () => {
          expect(tuple([])([1])).toEqual(false)
          expect(tuple([isString])(['hello', 'hello again'])).toEqual(false)
          expect(tuple([isString, isNumber])(['hello', 123, true])).toEqual(
            false,
          )
        })
        it('does not allow fewer elements', () => {
          expect(tuple([isBoolean])([])).toEqual(false)
          expect(tuple([isString, isString])(['hello'])).toEqual(false)
          expect(tuple([isString, isNumber])([])).toEqual(false)
        })
      })
      describe('records', () => {
        it('validates null', () => {
          const isObj = object({})
          expect(isObj(null)).toEqual(false)
        })
        it('validates undefined', () => {
          const isObj = object({})
          expect(isObj(undefined)).toEqual(false)
        })
        it('validates empty records', () => {
          const isObj = object({})
          expect(isObj({})).toEqual(true)
        })
        it('allows unknown properties', () => {
          const isObj = object({})
          expect(isObj({ a: 'unexpected!' })).toEqual(true)
        })
        it('validates required properties', () => {
          const isObj = object({
            a: isString,
          })
          expect(
            isObj({
              a: 'hello',
            }),
          ).toEqual(true)
          expect(isObj({})).toEqual(false)
          expect(isObj({ a: undefined })).toEqual(false)
        })
        it('validates optional properties', () => {
          const isObj = object({
            a: optional(isString),
          })
          expect(
            isObj({
              a: 'hello',
            }),
          ).toEqual(true)
          expect(isObj({})).toEqual(true)
          expect(isObj({ a: undefined })).toEqual(true)
        })
      })
      describe('dictionaries', () => {
        it('validates null', () => {
          expect(record(isString)(null)).toEqual(false)
        })
        it('validates undefined', () => {
          expect(record(isString)(undefined)).toEqual(false)
        })
        it('validates empty records', () => {
          expect(record(isString)({})).toEqual(true)
        })
        it('invalidates empty arrays', () => {
          expect(record(isString)([])).toEqual(false)
        })
        it('validates records where the type of the keys match', () => {
          expect(record(isString)({ a: 'hello', b: 'hello2' })).toEqual(true)
          expect(record(isNumber)({ a: 1, b: 1 })).toEqual(true)
          expect(record(isBoolean)({ a: true, b: false })).toEqual(true)
        })
        it('invalidates records where the type of any key does not match', () => {
          expect(record(isString)({ a: 'hello', b: 1 })).toEqual(false)
          expect(record(isNumber)({ a: 'hello', b: 1 })).toEqual(false)
          expect(record(isBoolean)({ a: 'hello', b: true })).toEqual(false)
        })
        it('invalidates arrays', () => {
          expect(record(isString)([])).toEqual(false)
        })
      })
    })
    describe('recursive types', () => {
      describe('isArray', () => {
        it('validates null', () => {
          expect(array(isUnknown)(null)).toEqual(false)
        })
        it('validates undefined', () => {
          expect(array(isUnknown)(undefined)).toEqual(false)
        })
        it('validates unassigned values', () => {
          let data
          expect(array(isUnknown)(data)).toEqual(false)
        })
        it('validates booleans', () => {
          expect(array(isUnknown)(false)).toEqual(false)
          expect(array(isUnknown)(true)).toEqual(false)
        })
        it('validates numbers', () => {
          expect(array(isUnknown)(NaN)).toEqual(false)
          expect(array(isUnknown)(Infinity)).toEqual(false)
          expect(array(isUnknown)(0)).toEqual(false)
          expect(array(isUnknown)(1)).toEqual(false)
          expect(array(isUnknown)(3.14159)).toEqual(false)
        })
        it('validates strings', () => {
          expect(array(isUnknown)('')).toEqual(false)
          expect(array(isUnknown)('hello')).toEqual(false)
        })
        it('validates symbols', () => {
          expect(array(isUnknown)(Symbol())).toEqual(false)
        })
        it('validates objects', () => {
          expect(array(isUnknown)({})).toEqual(false)
        })
        it('validates empty arrays', () => {
          expect(array(isUnknown)([])).toEqual(true)
        })
        it('always validates empty arrays', () => {
          expect(array(isUnknown)([])).toEqual(true)
          expect(array(isString)([])).toEqual(true)
          expect(array(isBoolean)([])).toEqual(true)
          expect(array((data: unknown): data is unknown => false)([])).toEqual(
            true,
          )
        })
        it('expects every element to pass the validation', () => {
          expect(array(union([isNumber]))([1, 2, 3, 4])).toEqual(true)
          expect(array(union([isNumber]))([1, 2, 3, 'a', 4])).toEqual(false)
          expect(
            array(union([isString, isNumber, isBoolean]))([1, 'a', false]),
          ).toEqual(true)
        })
      })
    })
  })
})
