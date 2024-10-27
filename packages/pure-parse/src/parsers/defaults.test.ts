import { describe, expect, it, test } from 'vitest'
import {
  failWith,
  InfallibleParser,
  succeedWith,
  UnsuccessfulParser,
  withDefault,
} from './defaults'
import { Equals } from '../internals'
import { isSuccess, Parser } from './types'
import { parseString } from './primitives'
import { object } from './object'

describe('succeedWith', () => {
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

describe('failWith', () => {
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
