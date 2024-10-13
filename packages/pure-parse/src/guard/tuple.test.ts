import { describe, expect, it, test } from 'vitest'
import { tuple } from './tuple'
import { Guard } from './types'
import { isBoolean, isNumber, isString } from './primitives'

describe('tuples', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      tuple([]) satisfies Guard<[]>
      tuple([isString]) satisfies Guard<[string]>
      tuple([isString, isNumber]) satisfies Guard<[string, number]>
      tuple([isNumber, isNumber, isNumber]) satisfies Guard<
        [number, number, number]
      >

      // @ts-expect-error
      tuple([isNumber]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tuple([isString, isString]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tuple([isNumber, isNumber]) satisfies Guard<[string, string]>
    })
    test('explicit generic type annotation', () => {
      tuple<[]>([])
      tuple<[string]>([isString])
      tuple<[string, number]>([isString, isNumber])
      tuple<[number, number, number]>([isNumber, isNumber, isNumber])
      // @ts-expect-error
      tuple<[number, number]>([isNumber])
      // @ts-expect-error
      tuple<[number, number]>([isString, isString])
      // @ts-expect-error
      tuple<[string, string]>([isNumber, isNumber])
    })
  })
  it('validates each element', () => {
    expect(tuple([])([])).toEqual(true)
    expect(tuple([isString])(['hello'])).toEqual(true)
    expect(tuple([isString, isNumber])(['hello', 123])).toEqual(true)
    expect(
      tuple([isString, isNumber, isBoolean])(['hello', 123, false]),
    ).toEqual(true)
  })
  it('does not allow additional elements', () => {
    expect(tuple([])([1])).toEqual(false)
    expect(tuple([isString])(['hello', 'hello again'])).toEqual(false)
    expect(tuple([isString, isNumber])(['hello', 123, true])).toEqual(false)
  })
  it('does not allow fewer elements', () => {
    expect(tuple([isBoolean])([])).toEqual(false)
    expect(tuple([isString, isString])(['hello'])).toEqual(false)
    expect(tuple([isString, isNumber])([])).toEqual(false)
  })
})
