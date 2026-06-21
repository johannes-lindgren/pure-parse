import { describe, expect, it } from 'vitest'
import { parseNever } from './never'
import { isSuccess, ParseFailure, ParseSuccess } from './ParseResult'
import { Equals } from '../internals'
import { Infer } from '../common'
import { oneOf } from './oneOf'
import { parseNumber } from './primitives'
import { parseString } from './primitives'
import { Parser } from './Parser'

describe('parseNever', () => {
  it('it always fails', () => {
    expect(isSuccess(parseNever(''))).toEqual(false)
    expect(isSuccess(parseNever(0))).toEqual(false)
    expect(isSuccess(parseNever(false))).toEqual(false)
    expect(isSuccess(parseNever(true))).toEqual(false)
    expect(isSuccess(parseNever(undefined))).toEqual(false)
    expect(isSuccess(parseNever(null))).toEqual(false)
    expect(isSuccess(parseNever({}))).toEqual(false)
    expect(isSuccess(parseNever([]))).toEqual(false)
  })
  it('acts as identity element for oneOf', () => {
    const parsers = [parseString, parseNumber]
    const parse = parsers.reduce(
      (prevParser, currentParser) => oneOf(prevParser, currentParser),
      parseNever as Parser<unknown>,
    )
    expect(isSuccess(parse('hello'))).toEqual(true)
    expect(isSuccess(parse(42))).toEqual(true)
    expect(isSuccess(parse(true))).toEqual(false)
  })
  describe('types', () => {
    it('infers never', () => {
      type T = Infer<typeof parseNever>
      const t1: Equals<Infer<typeof parseNever>, unknown> = false
      const t2: Equals<Infer<typeof parseNever>, never> = true
    })
    it('returns a parse failure', () => {
      const res = parseNever('hello')
      const t1: Equals<typeof res, ParseFailure> = true
      const t2: Equals<typeof res, ParseSuccess<never>> = false
    })
  })
})
