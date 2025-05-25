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
  recover,
} from './ParseResult'
import { parseNumber, parseString } from './primitives'
import { Equals } from '../internals'
import { array } from './arrays'
import { object } from './object'
import { oneOf } from './oneOf'

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
  describe('map', () => {
    test('stringify number', () => {
      const parseStringified = map(parseNumber, (value) => value.toString())
      expect(parseStringified(123)).toEqual(success('123'))
      expect(parseStringified(123.45)).toEqual(success('123.45'))
      expect(parseStringified('abc')).toEqual(expectFailure())
    })
    test('toUpperCase', () => {
      const parseUpperCase = map(parseString, (value) => value.toUpperCase())
      expect(parseUpperCase('abc')).toEqual(success('ABC'))
      expect(parseUpperCase(123)).toEqual(expectFailure())
    })
    describe('examples', () => {
      test('stringigy number', () => {
        const parseStringified = map(parseNumber, (it) => it.toString())
        expect(parseStringified(123)).toEqual(success('123'))
      })
      test('parsing uids', () => {
        type Todo = {
          uid: string
          title: string
        }
        const parseTodo = object<Todo>({
          uid: parseString,
          title: parseString,
        })
        const parseWithUid = object({
          uid: parseString,
        })
        const parseTodos = array<Todo>(
          oneOf(
            parseTodo,
            map(parseWithUid, (it) => ({
              ...it,
              title: 'Untitled',
            })),
          ),
        )
        const res = parseTodos([
          { uid: '1', title: 'Todo 1' },
          { uid: '2', title: 123 },
          { uid: '3' },
        ])
        expect(res).toEqual(
          success([
            { uid: '1', title: 'Todo 1' },
            { uid: '2', title: 'Untitled' },
            { uid: '3', title: 'Untitled' },
          ]),
        )
      })
    })
  })
  describe('chain', () => {
    const parsePositive = chain(parseNumber, (value) =>
      value > 0 ? success(value) : failure('Expected positive number'),
    )
    test('success to success', () => {
      expect(parsePositive(123)).toEqual(success(123))
    })
    test('success to failure', () => {
      expect(parsePositive(-123)).toEqual(expectFailure())
    })
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
    })
  })
  describe('recover', () => {
    it('allows static defaults', () => {
      const parseNum = recover(parseNumber, () => success(0))
      expect(parseNum(1)).toEqual(success(1))
      expect(parseNum('a')).toEqual(success(0))
    })
    it('can stay as failure', () => {
      const parseNum = recover(parseNumber, () => failure('Error'))
      expect(parseNum(1)).toEqual(success(1))
      expect(parseNum('a')).toEqual(expectFailure())
      expect(parseNum('a')).toEqual({
        tag: 'failure',
        error: 'Error',
        path: [],
      })
    })
    it('can recover to a different type with type annotation', () => {
      const parseNum = recover<number | undefined>(parseNumber, () =>
        success(undefined),
      )
      expect(parseNum(1)).toEqual(success(1))
      expect(parseNum('a')).toEqual(success(undefined))
    })
    it('can read the error message', () => {
      const parseFailure = () => failure('Expected type number')
      const parseNum = recover(parseFailure, (result) =>
        failure(`${result.error}!`),
      )
      expect(parseNum('abc')).toEqual(failure('Expected type number!'))
    })
  })
})
