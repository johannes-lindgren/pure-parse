import { describe, expect, it, test } from 'vitest'
import { array } from './arrays'
import { object } from './object'
import { union } from './union'
import { parseNumber, parseString } from './primitives'
import { fallback } from './fallback'
import { literal } from './literal'
import { optional } from './optional'

describe('parsing', () => {
  describe('some use cases', () => {
    test('parsing objects in an array with fallback', () => {
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
      const parseContent = union<
        [StringContent, NumberContent, UnknownContent]
      >(parseStringContent, parseNumberContent, parseUnknownContent)
      const parseDocument = object<Document>({
        title: parseString,
        description: optional(parseString),
        content: array(fallback(parseContent, { tag: 'unknown' })),
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
})
