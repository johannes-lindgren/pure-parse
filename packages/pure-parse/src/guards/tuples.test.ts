import { describe, expect, it, test } from 'vitest'
import { tupleGuard } from './tuples'
import { Guard } from './Guard'
import { isBoolean, isNumber, isString } from './primitives'

describe('tuples', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      tupleGuard([]) satisfies Guard<[]>
      tupleGuard([isString]) satisfies Guard<[string]>
      tupleGuard([isString, isNumber]) satisfies Guard<[string, number]>
      tupleGuard([isNumber, isNumber, isNumber]) satisfies Guard<
        [number, number, number]
      >

      // @ts-expect-error
      tupleGuard([isNumber]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tupleGuard([isString, isString]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tupleGuard([isNumber, isNumber]) satisfies Guard<[string, string]>
    })
    test('explicit generic type annotation', () => {
      tupleGuard<[]>([])
      tupleGuard<[string]>([isString])
      tupleGuard<[string, number]>([isString, isNumber])
      tupleGuard<[number, number, number]>([isNumber, isNumber, isNumber])
      // @ts-expect-error
      tupleGuard<[number, number]>([isNumber])
      // @ts-expect-error
      tupleGuard<[number, number]>([isString, isString])
      // @ts-expect-error
      tupleGuard<[string, string]>([isNumber, isNumber])
    })
  })
  it('validates each element', () => {
    expect(tupleGuard([])([])).toEqual(true)
    expect(tupleGuard([isString])(['hello'])).toEqual(true)
    expect(tupleGuard([isString, isNumber])(['hello', 123])).toEqual(true)
    expect(
      tupleGuard([isString, isNumber, isBoolean])(['hello', 123, false]),
    ).toEqual(true)
  })
  it('does not allow additional elements', () => {
    expect(tupleGuard([])([1])).toEqual(false)
    expect(tupleGuard([isString])(['hello', 'hello again'])).toEqual(false)
    expect(tupleGuard([isString, isNumber])(['hello', 123, true])).toEqual(
      false,
    )
  })
  it('does not allow fewer elements', () => {
    expect(tupleGuard([isBoolean])([])).toEqual(false)
    expect(tupleGuard([isString, isString])(['hello'])).toEqual(false)
    expect(tupleGuard([isString, isNumber])([])).toEqual(false)
  })
})
