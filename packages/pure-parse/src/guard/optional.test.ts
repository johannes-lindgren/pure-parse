import { describe, expect, it, test } from 'vitest'
import { nullable, optional, optionalNullable, undefineable } from './optional'
import { isBoolean, isNumber, isString } from './primitives'
import { objectGuard } from './object'
import { Infer } from '../common'
import { Equals } from '../internals'

describe('optional', () => {
  it('matches undefined', () => {
    expect(optional(isString)(undefined)).toEqual(true)
  })
  it('mismatches undefined', () => {
    expect(optional(isString)(null)).toEqual(false)
  })
  it('matches the guard type of the guard argument', () => {
    expect(optional(isBoolean)(true)).toEqual(true)
    expect(optional(isNumber)(123)).toEqual(true)
    expect(optional(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(optional(isBoolean)(123)).toEqual(false)
    expect(optional(isNumber)('hello')).toEqual(false)
    expect(optional(isString)(true)).toEqual(false)
  })
  it('represent optional properties', () => {
    const isObj = objectGuard({
      a: optional(isString),
    })
    expect(isObj({ a: 'hello' })).toEqual(true)
    expect(isObj({ a: undefined })).toEqual(true)
    expect(isObj({})).toEqual(true)
  })
  test('type inference', () => {
    const isObj = objectGuard({
      id: isNumber,
      name: optional(isString),
    })
    type User = {
      id: number
      name?: string
    }
    type InferredUser = Infer<typeof isObj>
    // @ts-expect-error -- TODO can't get this to work
    const t1: Equals<User, InferredUser> = true
    const t2: InferredUser = {
      id: 0,
      name: 'Johannes',
    }
    // @ts-expect-error -- TODO can't get this to work
    const t3: InferredUser = {
      id: 0,
    }
    const t4: InferredUser = {
      id: 0,
      name: undefined,
    }
  })
})
describe('nullable', () => {
  it('matches undefined', () => {
    expect(nullable(isString)(undefined)).toEqual(false)
  })
  it('mismatches undefined', () => {
    expect(nullable(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(nullable(isBoolean)(true)).toEqual(true)
    expect(nullable(isNumber)(123)).toEqual(true)
    expect(nullable(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(nullable(isBoolean)(123)).toEqual(false)
    expect(nullable(isNumber)('hello')).toEqual(false)
    expect(nullable(isString)(true)).toEqual(false)
  })
})
describe('optionalNullable', () => {
  it('matches undefined', () => {
    expect(optionalNullable(isString)(undefined)).toEqual(true)
  })
  it('mismatches undefined', () => {
    expect(optionalNullable(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(optionalNullable(isBoolean)(true)).toEqual(true)
    expect(optionalNullable(isNumber)(123)).toEqual(true)
    expect(optionalNullable(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(optionalNullable(isBoolean)(123)).toEqual(false)
    expect(optionalNullable(isNumber)('hello')).toEqual(false)
    expect(optionalNullable(isString)(true)).toEqual(false)
  })
  it('represent optional properties', () => {
    const isObj = objectGuard({
      a: optionalNullable(isString),
    })
    expect(isObj({ a: 'hello' })).toEqual(true)
    expect(isObj({ a: undefined })).toEqual(true)
    expect(isObj({ a: null })).toEqual(true)
    expect(isObj({})).toEqual(true)
  })
})
describe('nullable', () => {
  it('mismatches undefined', () => {
    expect(nullable(isString)(undefined)).toEqual(false)
  })
  it('matches null', () => {
    expect(nullable(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(nullable(isBoolean)(true)).toEqual(true)
    expect(nullable(isNumber)(123)).toEqual(true)
    expect(nullable(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(nullable(isBoolean)(123)).toEqual(false)
    expect(nullable(isNumber)('hello')).toEqual(false)
    expect(nullable(isString)(true)).toEqual(false)
  })
})
describe('undefinable', () => {
  it('matches undefined', () => {
    expect(undefineable(isString)(undefined)).toEqual(true)
  })
  it('mismatches null', () => {
    expect(undefineable(isString)(null)).toEqual(false)
  })
  it('matches the guard type of the guard argument', () => {
    expect(undefineable(isBoolean)(true)).toEqual(true)
    expect(undefineable(isNumber)(123)).toEqual(true)
    expect(undefineable(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(undefineable(isBoolean)(123)).toEqual(false)
    expect(undefineable(isNumber)('hello')).toEqual(false)
    expect(undefineable(isString)(true)).toEqual(false)
  })
})
