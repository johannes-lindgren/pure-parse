import { describe, expect, it } from 'vitest'
import { oneOf } from './oneOf'
import { parseNumber, parseString } from './primitives'
import { Equals } from '../internals'
import { failure, Parser, success } from './types'
import { isString } from '../guards'
import { object } from './object'
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
        tag: literal('left'),
      }),
      object({
        tag: literal('right'),
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
  // describe('with always (static defaults)', () => {
  // TODO can we reactivate this? It was easier to infer the type when we had withDefault
  // test('that the result type is infallible', () => {
  //   const res = oneOf(parseString, always(''))(123)
  //   const a1: typeof res = success('')
  //   // @ts-expect-error -- fallbackValue result is infallible
  //   const a3: typeof res = failure('')
  // })
  // })
})
