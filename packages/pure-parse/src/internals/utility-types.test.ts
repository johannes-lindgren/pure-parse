import { describe, it, test } from 'vitest'
import { Equals } from './Equals'
import { OptionalKeys, RequiredKeys } from './utility-types'

describe('RequiredKeys', () => {
  it('gives the keys', () => {
    const a1: Equals<RequiredKeys<{ a: 1 }>, 'a'> = true
    const a2: Equals<RequiredKeys<{ a: 1; b: 1 }>, 'a' | 'b'> = true
  })
  it('handles empty objects', () => {
    const a0: Equals<RequiredKeys<{}>, never> = true
    // @ts-expect-error
    const a1: Equals<RequiredKeys<{}>, never> = false
  })
  it('excludes optional keys', () => {
    const a1: Equals<RequiredKeys<{ a: 1; b?: 1 }>, 'a'> = true
    const a2: Equals<RequiredKeys<{ a: 1; b?: 1; c: 1 }>, 'a' | 'c'> = true
  })
})
describe('OptionalKeys', () => {
  it('gives the keys', () => {
    const a1: Equals<OptionalKeys<{ a?: 1 }>, 'a'> = true
    const a2: Equals<OptionalKeys<{ a?: 1; b?: 1 }>, 'a' | 'b'> = true
  })
  it('handles empty objects', () => {
    const a0: Equals<OptionalKeys<{}>, never> = true
    // @ts-expect-error
    const a1: Equals<OptionalKeys<{}>, never> = false
  })
  it('excludes required keys', () => {
    const a1: Equals<OptionalKeys<{ a?: 1; b: 1 }>, 'a'> = true
    const a2: Equals<OptionalKeys<{ a?: 1; b: 1; c?: 1 }>, 'a' | 'c'> = true
  })
})
