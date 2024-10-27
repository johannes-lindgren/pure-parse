import { describe, expect, it } from 'vitest'
import { parseUnknown } from './unknown'
import { isSuccess, ParseFailure, ParseSuccess, success } from './types'
import { Equals } from '../internals'
import { Infer } from '../common'

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
