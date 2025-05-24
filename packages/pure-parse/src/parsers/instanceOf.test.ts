import { describe, it, expect, test } from 'vitest'
import { instanceOf } from './instanceOf'
import { Equals } from '../internals'
import { Parser } from './Parser'

describe('instanceOfGuard', () => {
  it('validates functions', () => {
    function A() {}
    // @ts-ignore
    const a = new A()
    // @ts-ignore - Works at runtime, but TypeScript will complain
    expect(instanceOf(A)(a)).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  it('validates classes', () => {
    class A {}
    const a = new A()
    expect(instanceOf(A)(a)).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  it('invalidates subclasses', () => {
    class A {}
    class B {}
    const b = new B()
    expect(instanceOf(A)(b)).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  test('typedoc example', () => {
    const parseError = instanceOf(Error)
    expect(parseError(new Error())).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  test('type annotation', () => {
    const parseError = instanceOf<Error>(Error)
    const t1: Equals<typeof parseError, Parser<Error>> = true
  })
  test('type inferrence', () => {
    const parseError = instanceOf<Error>(Error)
    const t1: Equals<typeof parseError, Parser<Error>> = true
  })
})
