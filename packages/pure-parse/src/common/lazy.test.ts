import { describe, expect, it, test, vi } from 'vitest'
import { lazy } from './lazy'
import { Equals } from '../internals'

describe('lazy', () => {
  it('only constructs the function once (memoization)', () => {
    const construct = vi.fn(() => () => 42)
    const fn = lazy(construct)
    fn()
    fn()
    expect(construct).toHaveBeenCalledTimes(1)
  })
  it('lets you call the wrapped function normally', () => {
    const construct = vi.fn(() => (num: number) => num ** 3)
    const fn = lazy(construct)
    // Evaluation check
    expect(fn(3.14)).toBe(3.14 ** 3)
  })
  test('type inference', () => {
    const fn1 = lazy(() => () => 42)
    const t1: Equals<typeof fn1, () => number> = true

    const fn2 = lazy(() => (num: number) => num.toString())
    const t2: Equals<typeof fn2, (num: number) => string> = true

    const fn3 = lazy(() => (base: number, exp: number) => base ** exp)
    const t3: Equals<typeof fn3, (base: number, exp: number) => number> = true
  })
})
