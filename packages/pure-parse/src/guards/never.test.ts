import { describe, expect, it } from 'vitest'
import { Infer } from '../common'
import { isNever } from './never'
import { Equals } from '../internals'

describe('isNever', () => {
  it('is always false', () => {
    expect(isNever(null)).toEqual(false)
    expect(isNever(undefined)).toEqual(false)
    expect(isNever(false)).toEqual(false)
    expect(isNever(true)).toEqual(false)
    expect(isNever(123)).toEqual(false)
    expect(isNever(123n)).toEqual(false)
    expect(isNever('aaaaa')).toEqual(false)
    expect(isNever({})).toEqual(false)
    expect(isNever([])).toEqual(false)
  })
  describe('types', () => {
    it('infers never', () => {
      type T = Infer<typeof isNever>
      const t1: Equals<Infer<typeof isNever>, unknown> = false
      const t2: Equals<Infer<typeof isNever>, never> = true
    })
  })
})
