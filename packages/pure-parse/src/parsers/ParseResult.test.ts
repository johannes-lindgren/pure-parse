import { describe, expect, it, test } from 'vitest'
import {
  failure,
  map,
  chain,
  success,
  isSuccess,
  isFailure,
  ParseSuccess,
  ParseFailure,
} from './ParseResult'
import { parseNumber, parseString } from './primitives'
import { Equals } from '../internals'
import { Infer } from '../common'
import { array } from './arrays'

const expectFailure = () =>
  expect.objectContaining({
    tag: 'failure',
  })

describe('ParseResult', () => {
  describe('isSuccess', () => {
    test('success result', () => {
      expect(isSuccess(success(123))).toBe(true)
    })
    test('failure result', () => {
      expect(isSuccess(failure('Error'))).toBe(false)
    })
    describe('type checking', () => {
      test('the inferred type', () => {
        const res = success(1)
        const a: Equals<(typeof res)['value'], number> = true
      })
      test('the return type is just ParseSuccess', () => {
        const res = success(1)
        const a: Equals<typeof res, ParseSuccess<number>> = true
      })
    })
  })
  describe('isFailure', () => {
    test('success result', () => {
      expect(isFailure(success(123))).toBe(false)
    })
    test('failure result', () => {
      expect(isFailure(failure('Error'))).toBe(true)
    })
    describe('type checking', () => {
      test('the return type is just ParseFailure', () => {
        const res = failure('Error')
        const a: Equals<typeof res, ParseFailure> = true
      })
    })
  })
  describe('map', () => {})
  describe('chain', () => {
    describe('examples', () => {
      test('stringify number', () => {
        const parseStringified = chain(parseNumber, (value) => success(value))
        expect(parseStringified(123)).toEqual(success(123))
      })
      test('parse stringified number', () => {
        const parseStringified = chain(parseString, (value) =>
          success(Number(value)),
        )
        expect(parseStringified('123')).toEqual(success(123))
      })
      test('parse integer', () => {
        const parseInt = chain(parseNumber, (value) =>
          Number.isInteger(value)
            ? success(value)
            : failure('Expected integer'),
        )
        expect(parseInt(0)).toEqual(success(0))
        expect(parseInt(123)).toEqual(success(123))
        expect(parseInt(123.45)).toEqual(expectFailure())
      })
      test('parse non-empty arrays', () => {
        const parseNonEmptyArray = chain(array(parseNumber), (value) =>
          value.length > 0
            ? success(value)
            : failure('Expected non-empty array'),
        )
        expect(parseNonEmptyArray([])).toEqual(expectFailure())
        expect(parseNonEmptyArray([1, 2, 3])).toEqual(success([1, 2, 3]))
      })
      // test('fallback to default value', () => {
      //   const parseWithDefault = flatMap(parseString, (value) => s
      // })
    })
  })
})
