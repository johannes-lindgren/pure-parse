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
} from './ParseResult'
import { Equals } from '../internals'
import { parseNumber } from './primitives'

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
})
