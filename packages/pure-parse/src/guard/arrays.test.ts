import { describe, expect, it, test } from 'vitest'
import { arrayGuard, nonEmptyArrayGuard } from './arrays'
import {
  isBoolean,
  isNonEmptyArray,
  isNumber,
  isString,
  isUnknown,
} from './primitives'
import { Guard } from './types'
import { Infer } from '../common'
import { Equals } from '../internals'
import { unionGuard } from './union'

describe('arrays', () => {
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
      arrayGuard<string | number>(unionGuard(isString, isNumber))
      // @ts-expect-error
      arrayGuard<number>(unionGuard(isString, isNumber))
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
    expect(arrayGuard(unionGuard(isNumber))([1, 2, 3, 4])).toEqual(true)
    expect(arrayGuard(unionGuard(isNumber))([1, 2, 3, 'a', 4])).toEqual(false)
    expect(
      arrayGuard(unionGuard(isString, isNumber, isBoolean))([1, 'a', false]),
    ).toEqual(true)
  })
})

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
      const isNumberArray = nonEmptyArrayGuard(isNumber)
      type NumberArray = Infer<typeof isNumberArray>
      const assertionNumber1: Equals<NumberArray, [number, ...number[]]> = true
      const assertionNumber2: Equals<NumberArray, number[]> = false
      const assertionNumber3: Equals<NumberArray, unknown[]> = false
      const assertionNumber4: Equals<NumberArray, [unknown, ...unknown[]]> =
        false
      // String
      const isStringArray = nonEmptyArrayGuard(isString)
      type StringArray = Infer<typeof isStringArray>
      const assertionString1: Equals<StringArray, [string, ...string[]]> = true
      const assertionString2: Equals<StringArray, string[]> = false
      const assertionString3: Equals<StringArray, unknown[]> = false
      const assertionString4: Equals<StringArray, [unknown, ...unknown[]]> =
        false
    })
  })
  it('validates nonempty arrays', () => {
    expect(nonEmptyArrayGuard(isUnknown)([1])).toEqual(true)
    expect(nonEmptyArrayGuard(isUnknown)([1, 2, 3])).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(nonEmptyArrayGuard(isUnknown)([])).toEqual(false)
  })
  it('invalidates non-arrays', () => {
    expect(nonEmptyArrayGuard(isUnknown)({})).toEqual(false)
  })
  it('validates each item in the array', () => {
    expect(nonEmptyArrayGuard(isNumber)([1, 2])).toEqual(true)
    expect(nonEmptyArrayGuard(isNumber)(['a', 'b'])).toEqual(false)
  })
})
