import { describe, it, expect, test } from 'vitest'
import { dictionary } from './dictionary'
import {
  parseBoolean,
  parseNumber,
  parseString,
  parseSymbol,
} from './primitives'
import { equals } from './equals'
import { Equals } from '../internals'
import { Infer } from '../common'
import { Parser } from './Parser'
import { failure, success } from './ParseResult'
import { isString } from '../guards'
import { oneOf } from './oneOf'
import { object } from './object'

const parseCapitalized: Parser<string> = (data) => {
  if (!isString(data)) {
    return failure('Expected a string')
  }
  return success(data.toUpperCase())
}

describe('record', () => {
  it('invalidates non-objects', () => {
    ;[1, 'a', true, null, undefined].forEach((data) => {
      expect(dictionary(parseString, parseBoolean)(data)).toEqual(
        expect.objectContaining({ tag: 'failure' }),
      )
    })
  })
  describe('types', () => {
    describe('type inference', () => {
      it('infers a non-partial record when the keys is a string', () => {
        const parse = dictionary(parseString, parseString)
        const t0: Equals<Infer<typeof parse>, Record<string, string>> = true
        const t1: Equals<Infer<typeof parse>, { [key: string]: string }> = true

        type A = {
          a: Record<string, string>
        }
        const parseA = object<A>({
          a: dictionary(parseString, parseString),
        })
      })
      it('infers a partial record when the keys is a union of string literals', () => {
        const parse = dictionary(oneOf(equals('a'), equals('b')), parseString)
        const t0: Equals<
          Infer<typeof parse>,
          Partial<Record<'a' | 'b', string>>
        > = true
        const t1: Equals<Infer<typeof parse>, { a?: string; b?: string }> = true
      })
      it('infers the value', () => {
        const parse1 = dictionary(parseString, parseNumber)
        const t0: Equals<Infer<typeof parse1>, Record<string, number>> = true

        const parse2 = dictionary(oneOf(equals('a'), equals('b')), parseString)
        const t1: Equals<
          Infer<typeof parse2>,
          Partial<Record<'a' | 'b', string>>
        > = true
      })
    })
    describe('explicit type declaration', () => {
      it('requires two type arguments', () => {
        dictionary<string, string>(parseString, parseString)
      })
      it('allows for string keys', () => {
        dictionary<string, string>(parseString, parseString)
      })
      it('allows for union keys', () => {
        dictionary<'a' | 'b', string>(
          oneOf(equals('a'), equals('b')),
          parseString,
        )
      })
      it('binds the second type argument to the second parser', () => {
        dictionary<string, string>(parseString, parseString)
        // @ts-expect-error
        dictionary<string, string>(parseString, parseNumber)
        // @ts-expect-error
        dictionary<string, number>(parseString, parseString)
        dictionary<string, number>(parseString, parseNumber)
      })
    })
  })
  describe('keys', () => {
    describe('string', () => {
      it('parses empty objects', () => {
        expect(dictionary(parseString, parseBoolean)({})).toEqual(
          expect.objectContaining({ tag: 'success' }),
        )
      })
      it('parses objects with string keys', () => {
        expect(
          dictionary(
            parseString,
            parseBoolean,
          )({
            a: true,
          }),
        ).toEqual(expect.objectContaining({ tag: 'success' }))
      })
      it('allows objects with non-string keys', () => {
        expect(
          dictionary(
            parseString,
            parseBoolean,
          )({
            [Symbol()]: true,
          }),
        ).toEqual(expect.objectContaining({ tag: 'success' }))
      })
    })
    test('number', () => {
      // @ts-expect-error -- can't use number, because numbers are coerced to strings
      dictionary(parseNumber, parseBoolean)
    })
    test('symbol', () => {
      // @ts-expect-error -- can't use symbol
      dictionary(parseSymbol, parseBoolean)
    })
    describe('unions', () => {
      it('parses unions', () => {
        const t0: { a: boolean; b: boolean } = { a: true, b: true }
        expect(
          dictionary(
            oneOf(equals('a'), equals('b')),
            parseBoolean,
          )({
            a: true,
            b: true,
          }),
        ).toEqual(
          expect.objectContaining({
            tag: 'success',
            value: {
              a: true,
              b: true,
            },
          }),
        )
      })
      it('fails on extra keys', () => {
        expect(
          dictionary(
            oneOf(equals('a'), equals('b')),
            parseBoolean,
          )({
            a: true,
            b: true,
            c: true,
          }),
        ).toEqual(expect.objectContaining({ tag: 'failure' }))
      })

      test('that keys are optional', () => {
        expect(
          dictionary(
            oneOf(equals('a'), equals('b')),
            parseBoolean,
          )({
            a: true,
          }),
        ).toEqual(
          expect.objectContaining({ tag: 'success', value: { a: true } }),
        )
      })
    })

    test('transformations', () => {
      const parseCapitalized: Parser<string> = (data) => {
        if (!isString(data)) {
          return failure('Expected a string')
        }
        return success(data.toUpperCase())
      }
      const parse = dictionary(parseCapitalized, parseNumber)
      expect(parse({ a: 1 })).toEqual(
        expect.objectContaining({ tag: 'success', value: { A: 1 } }),
      )
    })
  })
  describe('values', () => {
    it('parses empty objects', () => {
      expect(dictionary(parseString, parseBoolean)({})).toEqual(
        expect.objectContaining({ tag: 'success', value: {} }),
      )
    })
    it('parses objects with string values', () => {
      expect(dictionary(parseString, parseString)({ a: 'a' })).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: {
            a: 'a',
          },
        }),
      )
    })
    it('parses objects with boolean values', () => {
      expect(dictionary(parseString, parseBoolean)({ a: true })).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: {
            a: true,
          },
        }),
      )
    })
    it('invalidates values that do not pass validation', () => {
      expect(dictionary(parseString, parseBoolean)({ a: 'a' })).toEqual(
        expect.objectContaining({ tag: 'failure' }),
      )
    })
    test('transformations', () => {
      const parse = dictionary(parseString, parseCapitalized)
      expect(parse({ a: 'a' })).toEqual(
        expect.objectContaining({ tag: 'success', value: { a: 'A' } }),
      )
    })
  })
  describe('error handling', () => {
    test('that the error points to the object when it is not an object', () => {
      expect(dictionary(parseString, parseBoolean)(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
          error: expect.objectContaining({
            path: [],
          }),
        }),
      )
    })
    describe('property errors', () => {
      test('keys', () => {
        test('values', () => {
          expect(
            dictionary(
              equals('a'),
              parseBoolean,
            )({
              b: true,
            }),
          ).toEqual(
            expect.objectContaining({
              tag: 'failure',
              error: expect.objectContaining({
                path: [
                  {
                    tag: 'object',
                    key: 'a',
                  },
                ],
              }),
            }),
          )
        })
      })
      test('values', () => {
        expect(
          dictionary(
            parseString,
            parseBoolean,
          )({
            a: 1,
          }),
        ).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [
                {
                  tag: 'object',
                  key: 'a',
                },
              ],
            }),
          }),
        )
      })
    })
  })
})
