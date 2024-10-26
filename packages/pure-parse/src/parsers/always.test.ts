import { describe, expect, it, test } from 'vitest'
import {
  succeedWith,
  InfallibleParser,
  UnsuccessfulParser,
  parseUnknown,
  withDefault,
} from './always'
import { parseString } from './primitives'
import { object } from './object'
import { isSuccess, ParseFailure, Parser, ParseSuccess, success } from './types'
import { Equals } from '../internals'
import { Infer } from '../common'

describe('always', () => {
  it('always returns the value in the argument', () => {
    expect(succeedWith(0)(0)).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(succeedWith(0)(1)).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(succeedWith(0)('111')).toEqual(
      expect.objectContaining({
        value: 0,
      }),
    )
    expect(succeedWith('hello')(0)).toEqual(
      expect.objectContaining({
        value: 'hello',
      }),
    )
  })
  describe('types', () => {
    it('infers infallible parsers', () => {
      const parser = succeedWith('aa' as string)
      const t1: Equals<typeof parser, InfallibleParser<string>> = true
      const t2: Equals<typeof parser, Parser<string>> = false
      const t3: Equals<typeof parser, UnsuccessfulParser> = false
    })
    it('infers constants', () => {
      const parser = succeedWith(1)
      const t1: Equals<typeof parser, InfallibleParser<1>> = true
      const t2: Equals<typeof parser, InfallibleParser<number>> = false
    })
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

describe('parseUnknown', () => {
  it('it always succeeds', () => {
    expect(isSuccess(parseUnknown(''))).toEqual(true)
    expect(isSuccess(parseUnknown(0))).toEqual(true)
    expect(isSuccess(parseUnknown(false))).toEqual(true)
    expect(isSuccess(parseUnknown(true))).toEqual(true)
    expect(isSuccess(parseUnknown(undefined))).toEqual(true)
    expect(isSuccess(parseUnknown(null))).toEqual(true)
    expect(isSuccess(parseUnknown({}))).toEqual(true)
    expect(isSuccess(parseUnknown([]))).toEqual(true)
  })
  it('it always succeeds with the argument data', () => {
    expect(parseUnknown('')).toEqual(success(''))
    expect(parseUnknown(0)).toEqual(success(0))
    expect(parseUnknown(false)).toEqual(success(false))
    expect(parseUnknown(true)).toEqual(success(true))
    expect(parseUnknown(undefined)).toEqual(success(undefined))
    expect(parseUnknown(null)).toEqual(success(null))
    expect(parseUnknown({})).toEqual(success({}))
    expect(parseUnknown([])).toEqual(success([]))
  })
  describe('types', () => {
    it('infers unknown', () => {
      const t1: Equals<Infer<typeof parseUnknown>, unknown> = true
      const t2: Equals<Infer<typeof parseUnknown>, never> = false
    })
    it('returns a parse success', () => {
      const res = parseUnknown('hello')
      const t1: Equals<typeof res, ParseSuccess<unknown>> = true
      const t2: Equals<typeof res, ParseFailure> = false
    })
  })
})
