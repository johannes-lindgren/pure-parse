import { describe, it, expect } from 'vitest'
import {
  isArray,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  dictionary,
  isString,
  isUndefined,
  record,
  union,
  primitive,
  isSymbol,
  optional,
} from './validation'

describe('validation', () => {
  describe('primitives', () => {
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

  describe('data structures', () => {
    describe('isArray', () => {
      it('validates null', () => {
        expect(isArray(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isArray(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isArray(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isArray(false)).toEqual(false)
        expect(isArray(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isArray(NaN)).toEqual(false)
        expect(isArray(Infinity)).toEqual(false)
        expect(isArray(0)).toEqual(false)
        expect(isArray(1)).toEqual(false)
        expect(isArray(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isArray('')).toEqual(false)
        expect(isArray('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isArray(Symbol())).toEqual(false)
      })
      it('validates objects', () => {
        expect(isArray({})).toEqual(false)
      })
      it('validates empty arrays', () => {
        expect(isArray([])).toEqual(true)
      })
      it('validates arrays', () => {
        expect(isArray([1, 2, 3])).toEqual(true)
        expect(isArray(['a', 'b', 'c'])).toEqual(true)
        expect(isArray([false, true])).toEqual(true)
        expect(isArray([[]])).toEqual(true)
        expect(isArray([{}])).toEqual(true)
        expect(isArray([1, 'a', false, [], {}])).toEqual(true)
      })
    })

    describe('isObject', () => {
      it('validates null', () => {
        expect(isObject(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isObject(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isObject(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isObject(false)).toEqual(false)
        expect(isObject(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isObject(NaN)).toEqual(false)
        expect(isObject(Infinity)).toEqual(false)
        expect(isObject(0)).toEqual(false)
        expect(isObject(1)).toEqual(false)
        expect(isObject(3.14159)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isObject('')).toEqual(false)
        expect(isObject('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isObject(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isObject([])).toEqual(true)
      })
      it('validates empty objects', () => {
        expect(isObject({})).toEqual(true)
      })
      it('validates objects with keys', () => {
        expect(
          isObject({
            a: 1,
          }),
        ).toEqual(true)
        expect(
          isObject({
            a: () => 'fun!',
          }),
        ).toEqual(true)
      })
    })
  })

  describe('algebraic data types', () => {
    describe('literal types', () => {
      describe('primitive', () => {
        it('matches null', () => {
          expect(primitive(null)(null)).toEqual(true)
        })
        it('matches undefined', () => {
          expect(primitive(undefined)(undefined)).toEqual(true)
        })
        it('matches strings', () => {
          expect(primitive('')('')).toEqual(true)
          expect(primitive('a')('a')).toEqual(true)
          expect(primitive('abc')('123')).toEqual(false)
        })
        it('matches numbers', () => {
          expect(primitive(-1)(-1)).toEqual(true)
          expect(primitive(0)(0)).toEqual(true)
          expect(primitive(1)(1)).toEqual(true)

          expect(primitive(123)('123')).toEqual(false)
        })
        it('matches booleans', () => {
          expect(primitive(true)(true)).toEqual(true)
          expect(primitive(false)(false)).toEqual(true)
          expect(primitive(true)(false)).toEqual(false)
          expect(primitive(false)(true)).toEqual(false)
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
    })
    describe('product types', () => {
      describe('tuples', () => {})
      describe('records', () => {
        it('validates empty records', () => {
          const isObj = record({})
          expect(isObj({})).toEqual(true)
        })
        it('allows unknown properties', () => {
          const isObj = record({})
          expect(isObj({ a: 'unexpected!' })).toEqual(true)
        })
        it('validates required properties', () => {
          const isObj = record({
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
          const isObj = record({
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
        it('validates empty records', () => {
          expect(dictionary(isString)({})).toEqual(true)
        })
        it('invalidates empty arrays', () => {
          expect(dictionary(isString)([])).toEqual(false)
        })
        it('validates records where the type of the keys match', () => {
          expect(dictionary(isString)({ a: 'hello', b: 'hello2' })).toEqual(
            true,
          )
          expect(dictionary(isNumber)({ a: 1, b: 1 })).toEqual(true)
          expect(dictionary(isBoolean)({ a: true, b: false })).toEqual(true)
        })
        it('invalidates records where the type of any key does not match', () => {
          expect(dictionary(isString)({ a: 'hello', b: 1 })).toEqual(false)
          expect(dictionary(isNumber)({ a: 'hello', b: 1 })).toEqual(false)
          expect(dictionary(isBoolean)({ a: 'hello', b: true })).toEqual(false)
        })
        it('invalidates arrays', () => {
          expect(dictionary(isString)([])).toEqual(false)
        })
      })
    })
  })
})
