import { describe, expect, it } from 'vitest'
import { oneOf } from './oneOf'
import { parseNumber, parseString } from './primitives'
import { Equals } from '../internals'
import { Parser } from './Parser'
import { failure, success } from './ParseResult'
import { isString } from '../guards'
import { object } from './object'
import { equals } from './equals'
import { parseNumberFromString } from './parseNumberFromString'

type RichText = {
  tag: 'text'
  value: string
}
const parsRichTextFromString: Parser<RichText> = (data) => {
  if (!isString(data)) {
    return failure('Expected a string')
  }
  return success({
    tag: 'text',
    value: data,
  })
}
const parseRichTextNode = object({
  tag: equals('text'),
  value: parseString,
})

describe('oneOf', () => {
  it('parses union types', () => {
    const parseStringOrNumber = oneOf(parseNumber, parseString)
    expect(parseStringOrNumber(1)).toEqual(
      expect.objectContaining({
        value: 1,
      }),
    )
    expect(parseStringOrNumber('hello')).toEqual(
      expect.objectContaining({
        value: 'hello',
      }),
    )
  })
  it('parses discriminated unions', () => {
    const parseStringOrNumber = oneOf(
      object({
        tag: equals('left'),
      }),
      object({
        tag: equals('right'),
      }),
    )
    expect(
      parseStringOrNumber({
        tag: 'left',
      }),
    ).toEqual(
      expect.objectContaining({
        value: {
          tag: 'left',
        },
      }),
    )
    expect(
      parseStringOrNumber({
        tag: 'right',
      }),
    ).toEqual(
      expect.objectContaining({
        value: {
          tag: 'right',
        },
      }),
    )
    expect(parseStringOrNumber('hello')).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  it('returns the first successful result', () => {
    // Parse number form stringified number or number
    const parseNum = oneOf(parseNumber, parseNumberFromString)
    expect(parseNum(1)).toEqual(
      expect.objectContaining({
        value: 1,
      }),
    )
    expect(parseNum('2')).toEqual(
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
    it('infers type from a pair of parsers as a union', () => {
      const parse = oneOf(parseNumber, parseString)
      const t: Equals<typeof parse, Parser<number | string>> = true
    })
    it('infers type from a pair of parsers of the same type as a non-union', () => {
      const parse = oneOf(parseNumber, parseNumberFromString)
      const t: Equals<typeof parse, Parser<number>> = true
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
