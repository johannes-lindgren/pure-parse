import { describe, it } from 'vitest'
import { Equals, OmitProperty } from '../../internals'
import { OptionalKeys, RequiredKeys, Simplify, Values } from './utility-types'

describe('utility types', () => {
  describe('RequiredKeys', () => {
    it('extract required keys', () => {
      const t0: Equals<
        RequiredKeys<{
          a: string
          b: string | OmitProperty
        }>,
        'a'
      > = true
    })
    it('handles required unknown', () => {
      const t1: Equals<RequiredKeys<{ a: unknown }>, 'a'> = true
      // @ts-expect-error -- the library cannot correctly infer optional unknowns. This is a compromise.
      const t2: Equals<
        RequiredKeys<{ a: unknown | OmitProperty }>,
        never
      > = true
    })
  })
  describe('OptionalKeys', () => {
    it('extract optional keys', () => {
      const t0: Equals<
        OptionalKeys<{
          a: string
          b: string | OmitProperty
        }>,
        'b'
      > = true
    })
    it('handles optional unknown', () => {
      const t1: Equals<
        OptionalKeys<{
          a: unknown
        }>,
        never
      > = true
      // @ts-expect-error -- the library cannot correctly infer optional unknowns. This is a compromise.
      const t2: Equals<OptionalKeys<{ a: OmitProperty | unknown }>, 'a'> = true
    })
  })

  describe('Values', () => {
    it('handles empty objects', () => {
      const t1: Equals<Values<{}>, never> = true
    })
    it('handles non-empty objects', () => {
      const t1: Equals<Values<{ a: 1 }>, 1> = true
      const t2: Equals<Values<{ a: 1; b: 2 }>, 1 | 2> = true
    })
    it('handles duplicate values', () => {
      const t1: Equals<Values<{ a: 1; b: 1 }>, 1> = true
    })
  })
  describe('Simplify', () => {
    it('does not transform the type', () => {
      const t1: Equals<Simplify<{}>, {}> = true
      const t2: Equals<Simplify<{ a: string }>, { a: string }> = true
      const t3: Equals<Simplify<string>, string> = true
    })
  })
})
