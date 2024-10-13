import { describe, expect, it } from 'vitest'
import {
  isArray,
  isBigInt,
  isBoolean,
  isFunction,
  isNonEmptyArray,
  isNull,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
  isUnknown,
} from './primitives'
import { Equals } from '../internals'
import { nonEmptyArray } from './validation'
import { Infer } from '../common'

describe('guards', () => {
  describe('primitives', () => {
    describe('isUnknown', () => {
      it('is always true', () => {
        expect(isUnknown(null)).toEqual(true)
        expect(isUnknown(undefined)).toEqual(true)
        expect(isUnknown(false)).toEqual(true)
        expect(isUnknown(true)).toEqual(true)
        expect(isUnknown(123)).toEqual(true)
        expect(isUnknown(123n)).toEqual(true)
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
      it('validates bigint', () => {
        expect(isNull(0n)).toEqual(false)
        expect(isNull(-1n)).toEqual(false)
        expect(isNull(1n)).toEqual(false)
        expect(isNull(1324n)).toEqual(false)
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
      it('validates bigint', () => {
        expect(isUndefined(0n)).toEqual(false)
        expect(isUndefined(-1n)).toEqual(false)
        expect(isUndefined(1n)).toEqual(false)
        expect(isUndefined(1324n)).toEqual(false)
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
      it('validates bigint', () => {
        expect(isBoolean(0n)).toEqual(false)
        expect(isBoolean(-1n)).toEqual(false)
        expect(isBoolean(1n)).toEqual(false)
        expect(isBoolean(1324n)).toEqual(false)
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
      it('validates bigint', () => {
        expect(isNumber(0n)).toEqual(false)
        expect(isNumber(-1n)).toEqual(false)
        expect(isNumber(1n)).toEqual(false)
        expect(isNumber(1324n)).toEqual(false)
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

    describe('isBigInt', () => {
      it('validates null', () => {
        expect(isBigInt(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isBigInt(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isBigInt(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isBigInt(false)).toEqual(false)
        expect(isBigInt(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isBigInt(NaN)).toEqual(false)
        expect(isBigInt(Infinity)).toEqual(false)
        expect(isBigInt(0)).toEqual(false)
        expect(isBigInt(1)).toEqual(false)
        expect(isBigInt(3.14159)).toEqual(false)
      })
      it('validates bigint', () => {
        expect(isBigInt(0n)).toEqual(true)
        expect(isBigInt(-1n)).toEqual(true)
        expect(isBigInt(1n)).toEqual(true)
        expect(isBigInt(1324n)).toEqual(true)
      })
      it('validates strings', () => {
        expect(isBigInt('')).toEqual(false)
        expect(isBigInt('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isBigInt(Symbol())).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isBigInt([])).toEqual(false)
      })
      it('validates objects', () => {
        expect(isBigInt({})).toEqual(false)
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
      it('validates bigint', () => {
        expect(isString(0n)).toEqual(false)
        expect(isString(-1n)).toEqual(false)
        expect(isString(1n)).toEqual(false)
        expect(isString(1324n)).toEqual(false)
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
      it('validates bigint', () => {
        expect(isSymbol(0n)).toEqual(false)
        expect(isSymbol(-1n)).toEqual(false)
        expect(isSymbol(1n)).toEqual(false)
        expect(isSymbol(1324n)).toEqual(false)
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
  describe('reference types', () => {
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
      it('validates bigint', () => {
        expect(isObject(0n)).toEqual(false)
        expect(isObject(-1n)).toEqual(false)
        expect(isObject(1n)).toEqual(false)
        expect(isObject(1324n)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isObject('')).toEqual(false)
        expect(isObject('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isObject(Symbol())).toEqual(false)
      })
      it('validates objects', () => {
        expect(isObject({})).toEqual(true)
      })
      it('validates arrays', () => {
        expect(isObject([])).toEqual(true)
      })
      it('validates functions', () => {
        expect(isObject(() => undefined)).toEqual(false)
      })
    })
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
      it('validates bigint', () => {
        expect(isArray(0n)).toEqual(false)
        expect(isArray(-1n)).toEqual(false)
        expect(isArray(1n)).toEqual(false)
        expect(isArray(1324n)).toEqual(false)
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
      it('validates arrays', () => {
        expect(isArray([])).toEqual(true)
      })
      it('validates functions', () => {
        expect(isArray(() => undefined)).toEqual(false)
      })
    })
    describe('isFunction', () => {
      it('validates null', () => {
        expect(isFunction(null)).toEqual(false)
      })
      it('validates undefined', () => {
        expect(isFunction(undefined)).toEqual(false)
      })
      it('validates unassigned values', () => {
        let data
        expect(isFunction(data)).toEqual(false)
      })
      it('validates booleans', () => {
        expect(isFunction(false)).toEqual(false)
        expect(isFunction(true)).toEqual(false)
      })
      it('validates numbers', () => {
        expect(isFunction(NaN)).toEqual(false)
        expect(isFunction(Infinity)).toEqual(false)
        expect(isFunction(0)).toEqual(false)
        expect(isFunction(1)).toEqual(false)
        expect(isFunction(3.14159)).toEqual(false)
      })
      it('validates bigint', () => {
        expect(isFunction(0n)).toEqual(false)
        expect(isFunction(-1n)).toEqual(false)
        expect(isFunction(1n)).toEqual(false)
        expect(isFunction(1324n)).toEqual(false)
      })
      it('validates strings', () => {
        expect(isFunction('')).toEqual(false)
        expect(isFunction('hello')).toEqual(false)
      })
      it('validates symbols', () => {
        expect(isFunction(Symbol())).toEqual(false)
      })
      it('validates objects', () => {
        expect(isFunction({})).toEqual(false)
      })
      it('validates arrays', () => {
        expect(isFunction([])).toEqual(false)
      })
      it('validates functions', () => {
        expect(isFunction(() => undefined)).toEqual(true)
      })
    })
  })

  describe('non-empty arrays', () => {
    describe('nonEmptyArray', () => {
      describe('type', () => {
        it('infers the type', () => {
          const numberArray: number[] = [1, 2, 3]
          if (isNonEmptyArray(numberArray)) {
            const assertionKnownArrayType4: Equals<
              typeof numberArray,
              [number, ...number[]]
            > = true
          }
        })
        it('infers the exact type', () => {
          // Number
          const isNumberArray = nonEmptyArray(isNumber)
          type NumberArray = Infer<typeof isNumberArray>
          const assertionNumber1: Equals<NumberArray, [number, ...number[]]> =
            true
          const assertionNumber2: Equals<NumberArray, number[]> = false
          const assertionNumber3: Equals<NumberArray, unknown[]> = false
          const assertionNumber4: Equals<NumberArray, [unknown, ...unknown[]]> =
            false
          // String
          const isStringArray = nonEmptyArray(isString)
          type StringArray = Infer<typeof isStringArray>
          const assertionString1: Equals<StringArray, [string, ...string[]]> =
            true
          const assertionString2: Equals<StringArray, string[]> = false
          const assertionString3: Equals<StringArray, unknown[]> = false
          const assertionString4: Equals<StringArray, [unknown, ...unknown[]]> =
            false
        })
      })
      it('validates nonempty arrays', () => {
        expect(nonEmptyArray(isUnknown)([1])).toEqual(true)
        expect(nonEmptyArray(isUnknown)([1, 2, 3])).toEqual(true)
      })
      it('invalidates empty arrays', () => {
        expect(nonEmptyArray(isUnknown)([])).toEqual(false)
      })
      it('invalidates non-arrays', () => {
        expect(nonEmptyArray(isUnknown)({})).toEqual(false)
      })
      it('validates each item in the array', () => {
        expect(nonEmptyArray(isNumber)([1, 2])).toEqual(true)
        expect(nonEmptyArray(isNumber)(['a', 'b'])).toEqual(false)
      })
    })
  })
})
