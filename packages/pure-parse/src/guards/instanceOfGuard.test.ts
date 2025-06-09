import { describe, it, expect, test } from 'vitest'
import { instanceOfGuard } from './instanceOfGuard'
import { Equals } from '../internals'
import { Guard } from './Guard'

describe('instanceOfGuard', () => {
  it('validates functions', () => {
    function A() {}
    // @ts-ignore
    const a = new A()
    // @ts-ignore - Works at runtime, but TypeScript will complain
    expect(instanceOfGuard(A)(a)).toEqual(true)
  })
  it('validates classes', () => {
    class A {}
    const a = new A()
    expect(instanceOfGuard(A)(a)).toEqual(true)
  })
  it('invalidates subclasses', () => {
    class A {}
    class B {}
    const b = new B()
    expect(instanceOfGuard(A)(b)).toEqual(false)
  })
  test('typedoc example', () => {
    const isError = instanceOfGuard(Error)
    expect(isError(new Error())).toEqual(true)
  })
  test('type annotation', () => {
    const parseError = instanceOfGuard<Error>(Error)
    const t1: Equals<typeof parseError, Guard<Error>> = true
  })
  test('type inferrence', () => {
    const parseError = instanceOfGuard<Error>(Error)
    const t1: Equals<typeof parseError, Guard<Error>> = true
  })
})
