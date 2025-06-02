import { describe, expect, it, test, vi } from 'vitest'
import { array } from './arrays'
import { object } from './object'
import { oneOf } from './oneOf'
import { parseNumber, parseString } from './primitives'
import { equals } from './equals'
import { optional } from './optional'
import { withDefault } from './withDefault'
import { failure, isSuccess, ParseFailure, success } from './ParseResult'
import { chain, map, recover } from './Parser'

const expectFailure = () =>
  expect.objectContaining({
    tag: 'failure',
  })

describe('parsing', () => {
  describe('some use cases', () => {
    test('parsing objects in an array with fallbackValue', () => {
      /*
       * Type aliases
       */
      type StringContent = {
        tag: 'string'
        value: string
      }
      type NumberContent = {
        tag: 'number'
        value: number
      }
      type UnknownContent = {
        tag: 'unknown'
      }
      type Content = StringContent | NumberContent | UnknownContent
      type Document = {
        title: string
        description?: string
        content: Content[]
      }
      /*
       * Parsers
       */
      const parseStringContent = object<StringContent>({
        tag: equals('string'),
        value: parseString,
      })
      const parseNumberContent = object<NumberContent>({
        tag: equals('number'),
        value: parseNumber,
      })
      const parseUnknownContent = object<UnknownContent>({
        tag: equals('unknown'),
      })
      const parseContent = oneOf<
        [StringContent, NumberContent, UnknownContent]
      >(parseStringContent, parseNumberContent, parseUnknownContent)
      const parseDocument = object<Document>({
        title: parseString,
        description: optional(parseString),
        content: array(withDefault(parseContent, { tag: 'unknown' })),
      })
      /*
       * Tests
       */
      const data = {
        title: 'My document',
        content: [
          { tag: 'string', value: 'day 1' },
          // Note that this has a type mismatch error
          { tag: 'string', value: 2 },
          { tag: 'number', value: 3 },
        ],
      }
      expect(parseDocument(data)).toEqual(
        expect.objectContaining({
          value: {
            title: data.title,
            content: [
              { tag: 'string', value: 'day 1' },
              // Fallback in place
              { tag: 'unknown' },
              { tag: 'number', value: 3 },
            ],
          },
        }),
      )
    })
  })
  describe('Parser Combinators', () => {
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
      test('that the callback function receives the value', () => {
        const error = success(123)
        const parseSuccess = () => error
        const callback = vi.fn((value: number) => success(1234556))
        const parseNum = chain(parseSuccess, callback)
        parseNum('abc')
        expect(callback).toHaveBeenCalledWith(123)
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
          error: expect.objectContaining({
            message: 'Error',
            path: [],
          }),
        })
      })
      it('can change the error message', () => {
        const parseUuid = recover(parseString, () =>
          failure('A UUID must be a string'),
        )
        const result = parseUuid(123)
        if (isSuccess(result)) {
          throw new Error('Expected failure')
        }
        expect(result.error.message).toEqual('A UUID must be a string')
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
        const parseNum = recover(parseFailure, (error) =>
          failure(`${error.message}!`),
        )
        expect(parseNum('abc')).toEqual(failure('Expected type number!'))
      })
      test('that the callback function receives the error', () => {
        const error = failure('Expected type number')
        const parseFailure = () => error
        const callback = vi.fn((error: ParseFailure['error']) =>
          failure('Some other error'),
        )
        const parseNum = recover(parseFailure, callback)
        parseNum('abc')
        expect(callback).toHaveBeenCalledWith(error.error)
      })
    })
  })
})
