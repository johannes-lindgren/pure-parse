import { describe, expect, it } from 'vitest'
import { isUnknown } from './unknown'
import { Infer } from '../common'
import { Equals } from '../internals'

describe('isUnknown', () => {
  it('is always true', () => {
    expect(isUnknown(null)).toEqual(true)
    expect(isUnknown(undefined)).toEqual(true)
    expect(isUnknown(false)).toEqual(true)
    expect(isUnknown(true)).toEqual(true)
    expect(isUnknown(123)).toEqual(true)
    expect(isUnknown(123n)).toEqual(true)
    expect(isUnknown('aaaaa')).toEqual(true)
    expect(isUnknown({})).toEqual(true)
    expect(isUnknown([])).toEqual(true)
  })
  describe('types', () => {
    it('infers unknown', () => {
      type T = Infer<typeof isUnknown>
      const t1: Equals<Infer<typeof isUnknown>, unknown> = true
      const t2: Equals<Infer<typeof isUnknown>, never> = false
    })
  })
})
