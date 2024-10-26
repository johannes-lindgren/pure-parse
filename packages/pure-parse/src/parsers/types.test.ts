import { describe, expect, it, test } from 'vitest'
import { array } from './arrays'
import { object } from './object'
import { oneOf } from './oneOf'
import { parseNumber, parseString } from './primitives'
import { literal } from './literal'
import { optional } from './optional'
import { succeedWith } from './always'
import { failure, ParseFailurePathSegment, propagateFailure } from './types'

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
        tag: literal('string'),
        value: parseString,
      })
      const parseNumberContent = object<NumberContent>({
        tag: literal('number'),
        value: parseNumber,
      })
      const parseUnknownContent = object<UnknownContent>({
        tag: literal('unknown'),
      })
      const parseContent = oneOf<
        [StringContent, NumberContent, UnknownContent]
      >(parseStringContent, parseNumberContent, parseUnknownContent)
      const parseDocument = object<Document>({
        title: parseString,
        description: optional(parseString),
        content: array(oneOf(parseContent, succeedWith({ tag: 'unknown' }))),
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
  describe('propagateFailure', () => {
    const segmentA: ParseFailurePathSegment = { tag: 'object', key: 'a' }
    const segmentB: ParseFailurePathSegment = { tag: 'object', key: 'b' }
    const segmentC: ParseFailurePathSegment = { tag: 'object', key: 'c' }
    it('keeps the original error message', () => {
      const errorMsg = '094uiroi34f'
      expect(
        propagateFailure(failure(errorMsg), { tag: 'object', key: 'a' }),
      ).toEqual(
        expect.objectContaining({
          error: errorMsg,
        }),
      )
    })
    it('includes the path segment in an error with no path segments', () => {
      expect(propagateFailure(failure('errorMsg'), segmentA)).toEqual(
        expect.objectContaining({
          path: [segmentA],
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
          path: [segmentA, segmentB],
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
          path: [segmentA, segmentB, segmentC],
        }),
      )
    })
  })
})
