import { describe, expect, it, test } from 'vitest'
import { oneOf, withDefault } from './fallback'
import { parseNumber, parseString } from './primitives'
import { object } from './object'
import { failure, Parser, success } from './types'
import { isString } from '../guards'
import { Equals } from '../internals'
import { literal } from './literal'

const parseNumberFromString: Parser<number> = (data) => {
  if (!isString(data)) {
    return failure('Not a string')
  }
  const num = parseFloat(data)
  if (isNaN(num)) {
    return failure('Not a number, but NaN')
  }
  return success(num)
}

type RichText = {
  tag: 'text'
  value: string
}
const parsRichTextFromString: Parser<RichText> = (data) => {
  if (!isString(data)) {
    return failure('Not a string')
  }
  return success({
    tag: 'text',
    value: data,
  })
}
const parseRichTextNode = object({
  tag: literal('text'),
  value: parseString,
})

describe('fallbacks', () => {
  describe('oneOf', () => {
    it('returns the first successful result', () => {
      const parseStrOrNum = oneOf(parseNumber, parseNumberFromString)
      expect(parseStrOrNum(1)).toEqual(
        expect.objectContaining({
          value: 1,
        }),
      )
      expect(parseStrOrNum('2')).toEqual(
        expect.objectContaining({
          value: 2,
        }),
      )
    })
    it('fails if all parsers fail', () => {
      const parseStrOrNum = oneOf(parseNumber, parseNumberFromString)
      expect(parseStrOrNum(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    describe('type inference', () => {
      it('infers the type from a lone parser', () => {
        const parse = oneOf(parseNumber)
        const t: Equals<typeof parse, Parser<number>> = true
      })
      it('infers type from a pair of parsers', () => {
        const parse = oneOf(parseNumber, parseString)
        const t: Equals<typeof parse, Parser<number | string>> = true
      })
    })
    it('allows you to mix parsers of the same type', () => {
      const parseRichText = oneOf(parsRichTextFromString, parseRichTextNode)
      expect(parseRichText('hello1')).toEqual({
        tag: 'success',
        value: {
          tag: 'text',
          value: 'hello1',
        },
      })
      expect(parseRichText({ tag: 'text', value: 'hello2' })).toEqual({
        tag: 'success',
        value: {
          tag: 'text',
          value: 'hello2',
        },
      })
      const t: Equals<typeof parseRichText, Parser<RichText>> = true
    })
  })
  describe('withDefault', () => {
    test('as a root parser', () => {
      const parseStr = withDefault(parseString, 'fallback')
      expect(parseStr('hello')).toEqual(
        expect.objectContaining({
          value: 'hello',
        }),
      )
      expect(parseStr(123)).toEqual(
        expect.objectContaining({
          value: 'fallback',
        }),
      )
    })
    test('as a nested parser', () => {
      const parseObj = object({
        name: withDefault(parseString, 'fallback'),
      })
      expect(parseObj({ name: 'hello' })).toEqual(
        expect.objectContaining({
          value: { name: 'hello' },
        }),
      )
    })
    describe('fallbackValue on fallbackValue', () => {
      it('uses the first fallbackValue', () => {
        const parseStr = withDefault(
          withDefault(parseString, 'fallback'),
          'fallback2',
        )
        expect(parseStr('hello')).toEqual(
          expect.objectContaining({
            value: 'hello',
          }),
        )
        expect(parseStr(123)).toEqual(
          expect.objectContaining({
            value: 'fallback',
          }),
        )
      })
    })
    test.todo('on optional properties')
  })
})
