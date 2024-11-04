import { describe, expect, it, test } from 'vitest'
import {
  nullableGuard,
  optionalGuard,
  optionalNullableGuard,
  undefineableGuard,
} from './optional'
import { isBoolean, isNumber, isString } from './primitives'
import { objectGuard } from './object'
import { Infer } from '../common'
import { Equals } from '../internals'

describe('optional', () => {
  it('matches undefined', () => {
    expect(optionalGuard(isString)(undefined)).toEqual(true)
  })
  it('mismatches undefined', () => {
    expect(optionalGuard(isString)(null)).toEqual(false)
  })
  it('matches the guard type of the guard argument', () => {
    expect(optionalGuard(isBoolean)(true)).toEqual(true)
    expect(optionalGuard(isNumber)(123)).toEqual(true)
    expect(optionalGuard(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(optionalGuard(isBoolean)(123)).toEqual(false)
    expect(optionalGuard(isNumber)('hello')).toEqual(false)
    expect(optionalGuard(isString)(true)).toEqual(false)
  })
  it('represent optional properties', () => {
    const isObj = objectGuard({
      a: optionalGuard(isString),
    })
    expect(isObj({ a: 'hello' })).toEqual(true)
    expect(isObj({ a: undefined })).toEqual(true)
    expect(isObj({})).toEqual(true)
  })
  test('type inference', () => {
    const isObj = objectGuard({
      id: isNumber,
      name: optionalGuard(isString),
    })
    type User = {
      id: number
      name?: string
    }
    type InferredUser = Infer<typeof isObj>
    const t1: Equals<User, InferredUser> = true
    const t2: InferredUser = {
      id: 0,
      name: 'Johannes',
    }
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
    expect(nullableGuard(isString)(undefined)).toEqual(false)
  })
  it('mismatches undefined', () => {
    expect(nullableGuard(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(nullableGuard(isBoolean)(true)).toEqual(true)
    expect(nullableGuard(isNumber)(123)).toEqual(true)
    expect(nullableGuard(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(nullableGuard(isBoolean)(123)).toEqual(false)
    expect(nullableGuard(isNumber)('hello')).toEqual(false)
    expect(nullableGuard(isString)(true)).toEqual(false)
  })
})
describe('optionalNullable', () => {
  it('matches undefined', () => {
    expect(optionalNullableGuard(isString)(undefined)).toEqual(true)
  })
  it('mismatches undefined', () => {
    expect(optionalNullableGuard(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(optionalNullableGuard(isBoolean)(true)).toEqual(true)
    expect(optionalNullableGuard(isNumber)(123)).toEqual(true)
    expect(optionalNullableGuard(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(optionalNullableGuard(isBoolean)(123)).toEqual(false)
    expect(optionalNullableGuard(isNumber)('hello')).toEqual(false)
    expect(optionalNullableGuard(isString)(true)).toEqual(false)
  })
  it('represent optional properties', () => {
    const isObj = objectGuard({
      a: optionalNullableGuard(isString),
    })
    expect(isObj({ a: 'hello' })).toEqual(true)
    expect(isObj({ a: undefined })).toEqual(true)
    expect(isObj({ a: null })).toEqual(true)
    expect(isObj({})).toEqual(true)
  })
})
describe('nullable', () => {
  it('mismatches undefined', () => {
    expect(nullableGuard(isString)(undefined)).toEqual(false)
  })
  it('matches null', () => {
    expect(nullableGuard(isString)(null)).toEqual(true)
  })
  it('matches the guard type of the guard argument', () => {
    expect(nullableGuard(isBoolean)(true)).toEqual(true)
    expect(nullableGuard(isNumber)(123)).toEqual(true)
    expect(nullableGuard(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(nullableGuard(isBoolean)(123)).toEqual(false)
    expect(nullableGuard(isNumber)('hello')).toEqual(false)
    expect(nullableGuard(isString)(true)).toEqual(false)
  })
})
describe('undefinable', () => {
  it('matches undefined', () => {
    expect(undefineableGuard(isString)(undefined)).toEqual(true)
  })
  it('mismatches null', () => {
    expect(undefineableGuard(isString)(null)).toEqual(false)
  })
  it('matches the guard type of the guard argument', () => {
    expect(undefineableGuard(isBoolean)(true)).toEqual(true)
    expect(undefineableGuard(isNumber)(123)).toEqual(true)
    expect(undefineableGuard(isString)('hello')).toEqual(true)
  })
  it('only matches the guard type of the guard argument', () => {
    expect(undefineableGuard(isBoolean)(123)).toEqual(false)
    expect(undefineableGuard(isNumber)('hello')).toEqual(false)
    expect(undefineableGuard(isString)(true)).toEqual(false)
  })
})
