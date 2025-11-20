import { describe, expect, it, test } from 'vitest'
import {
  failure,
  success,
  isSuccess,
  isFailure,
  ParseSuccess,
  ParseFailure,
  PathSegment,
  propagateFailure,
  mapSuccess,
  mapFailure,
  flatMapSuccess,
  flatMapFailure,
  unwrap,
} from './ParseResult'
import { Equals } from '../internals'
import { parseNumber } from './primitives'
import { formatResult } from './formatting'

describe('ParseResult', () => {
  describe('the `.error` property', () => {
    it('can be used to discriminate between Success and Failure', () => {
      const resultOk = parseNumber(123)
      // Type checking here
      if (resultOk.error) {
        throw new Error('Expected success result')
      }
      const t1: Equals<typeof resultOk, ParseSuccess<number>> = true
      expect(resultOk.tag).toEqual('success')

      const resultError = parseNumber('abc')
      if (!resultError.error) {
        throw new Error('Expected failure result')
      }
      const t2: Equals<typeof resultError, ParseFailure> = true
      expect(resultError.tag).toEqual('failure')
    })
  })
  describe('utilities', () => {
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
    describe('success', () => {
      it('creates a success result', () => {
        const result = success(123)
        expect(result).toEqual({
          tag: 'success',
          value: 123,
        })
      })
      test('that .error not `undefined`', () => {
        expect('error' in success(123)).toBe(false)
      })
    })
    describe('failure', () => {
      it('creates a failure result', () => {
        const result = failure('Error message')
        expect(result).toEqual({
          tag: 'failure',
          error: {
            message: 'Error message',
            path: [],
          },
        })
      })
    })
    describe('propagateFailure', () => {
      const segmentA: PathSegment = { tag: 'object', key: 'a' }
      const segmentB: PathSegment = { tag: 'object', key: 'b' }
      const segmentC: PathSegment = { tag: 'object', key: 'c' }
      it('keeps the original error message', () => {
        const errorMsg = '094uiroi34f'
        expect(
          propagateFailure(failure(errorMsg), { tag: 'object', key: 'a' }),
        ).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              message: errorMsg,
            }),
          }),
        )
      })
      it('includes the path segment in an error with no path segments', () => {
        expect(propagateFailure(failure('errorMsg'), segmentA)).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              path: [segmentA],
            }),
          }),
        )
      })
      it('prepends path segments to the path', () => {
        expect(
          propagateFailure(
            propagateFailure(failure('errorMsg'), segmentB),
            segmentA,
          ),
        ).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              path: [segmentA, segmentB],
            }),
          }),
        )
        expect(
          propagateFailure(
            propagateFailure(
              propagateFailure(failure('errorMsg'), segmentC),
              segmentB,
            ),
            segmentA,
          ),
        ).toEqual(
          expect.objectContaining({
            error: expect.objectContaining({
              path: [segmentA, segmentB, segmentC],
            }),
          }),
        )
      })
    })
  })
  describe('natural transformations', () => {
    describe(mapSuccess, () => {
      it('maps success values', () => {
        const res = success(2)
        const mapped = mapSuccess(res, (n) => n * 3)
        expect(mapped).toEqual(success(6))
      })
      it('does not map failure values', () => {
        const res = failure('Error occurred')
        const mapped = mapSuccess(res, (n: number) => n * 3)
        expect(mapped).toEqual(res)
      })
    })
    describe(flatMapSuccess, () => {
      it('allows chaining to another success', () => {
        const res = parseNumber(5)
        const flatMapped = flatMapSuccess(res, (n) => success(n * 2))
        expect(flatMapped).toEqual(success(10))
      })
      it('allows chaining to failure', () => {
        const res = parseNumber(5)
        const flatMapped = flatMapSuccess(res, (n) =>
          n > 10 ? success(n) : failure('Number is too small'),
        )
        expect(flatMapped).toEqual(failure('Number is too small'))
      })
    })
    describe(mapFailure, () => {
      it('maps failure values', () => {
        const res = failure('Original error')
        const mapped = mapFailure(res, (err) => ({
          ...err,
          message: 'Mapped error',
        }))
        expect(mapped).toEqual(failure('Mapped error'))
      })
      it('does not map success values', () => {
        const res = success(42)
        const mapped = mapFailure(res, (err) => ({
          ...err,
          message: 'Mapped error',
        }))
        expect(mapped).toEqual(res)
      })
    })
    describe(flatMapFailure, () => {
      it('allows recovery to success', () => {
        const res = failure('Initial error')
        const flatMapped = flatMapFailure(res, (err) => success(100))
        expect(flatMapped).toEqual(success(100))
      })
      it('allows recovery to another failure', () => {
        const res = failure('Initial error')
        const flatMapped = flatMapFailure(res, (err) =>
          failure(`Still failed: ${err.message}`),
        )
        expect(flatMapped).toEqual(failure('Still failed: Initial error'))
      })
    })
  })
  describe(unwrap, () => {
    it('returns the success value', () => {
      const res = success(77)
      const value = unwrap(res)
      expect(value).toBe(77)
    })
    it('throws on failure', () => {
      const res = failure('Cannot unwrap failure')
      expect(() => unwrap(res)).toThrow()
    })
    test('that the error contains the formatted Failure', () => {
      const message = 'Detailed error message'
      const res = failure(message)
      expect(() => unwrap(res)).toThrowError(new RegExp(formatResult(res)))
    })
  })
})
