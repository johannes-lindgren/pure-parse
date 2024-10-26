import { describe, expect, it } from 'vitest'
import { failWith, parseNever } from './never'
import { isSuccess, ParseFailure, Parser, ParseSuccess } from './types'
import { Equals } from '../internals'
import { InfallibleParser, UnsuccessfulParser } from './always'
import { Infer } from '../common'

describe('never', () => {
  it('always fails', () => {
    const parse = failWith('always fail')
    expect(isSuccess(parse(''))).toEqual(false)
    expect(isSuccess(parse(0))).toEqual(false)
    expect(isSuccess(parse(false))).toEqual(false)
    expect(isSuccess(parse(true))).toEqual(false)
    expect(isSuccess(parse(undefined))).toEqual(false)
    expect(isSuccess(parse(null))).toEqual(false)
    expect(isSuccess(parse({}))).toEqual(false)
    expect(isSuccess(parse([]))).toEqual(false)
  })
  describe('types', () => {
    it('infers infallible parsers', () => {
      const parser = failWith('never always fails')
      const t1: Equals<typeof parser, InfallibleParser<string>> = false
      const t2: Equals<typeof parser, Parser<string>> = false
      const t3: Equals<typeof parser, UnsuccessfulParser> = true
    })
  })
})

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
