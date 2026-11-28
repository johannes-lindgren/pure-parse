import { describe, it, expect } from 'vitest'
import { isJsonValue } from './json'

describe('isJsonValue', () => {
  it('validates null', () => {
    expect(isJsonValue(null)).toEqual(true)
  })
  it('validates boolean', () => {
    expect(isJsonValue(true)).toEqual(true)
    expect(isJsonValue(false)).toEqual(true)
  })
  it('validates number', () => {
    expect(isJsonValue(0)).toEqual(true)
    expect(isJsonValue(42)).toEqual(true)
    expect(isJsonValue(-42.5)).toEqual(true)
  })
  it('validates string', () => {
    expect(isJsonValue('')).toEqual(true)
    expect(isJsonValue('hello')).toEqual(true)
    expect(isJsonValue('123')).toEqual(true)
  })
  it('validates object', () => {
    expect(isJsonValue({})).toEqual(true)
    expect(isJsonValue({ key: 'value' })).toEqual(true)
    expect(isJsonValue({ key: 123, nested: { anotherKey: true } })).toEqual(
      true,
    )
  })
  it('validates array', () => {
    expect(isJsonValue([])).toEqual(true)
    expect(isJsonValue([1, 'two', true])).toEqual(true)
    expect(isJsonValue([null, { key: 'value' }, [1, 2, 3]])).toEqual(true)
  })
  it('invalidates non-JSON values', () => {
    expect(isJsonValue(undefined)).toEqual(false)
    expect(isJsonValue(() => {})).toEqual(false)
    expect(isJsonValue(Symbol('symbol'))).toEqual(false)
    expect(isJsonValue(new Date())).toEqual(false)
    expect(isJsonValue(new Map())).toEqual(false)
    expect(isJsonValue(new Set())).toEqual(false)
  })
  it('invalidates objects with non-plain prototype', () => {
    class TestClass {
      constructor(public prop: string) {}
    }

    expect(isJsonValue(new TestClass('test'))).toEqual(false)
  })
  it('invalidates class instances with toJSON', () => {
    class TestClass {
      constructor(public prop: string) {}
      toJSON() {
        return 'custom string representation'
      }
    }

    expect(isJsonValue(new TestClass('test'))).toEqual(false)
  })
  it('validates nested structures', () => {
    const complexJson = {
      key1: 'value1',
      key2: [1, 2, { key3: 'value3' }],
      key4: { key5: true, key6: null },
    }
    expect(isJsonValue(complexJson)).toEqual(true)
  })
  it('validates deeply nested data', () => {
    let nested: unknown = null
    for (let i = 0; i < 100_000; i++) {
      nested = i % 2 === 0 ? [nested] : { a: nested }
    }
    expect(isJsonValue(nested)).toEqual(true)
  })
  it('invalidates circular objects', () => {
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    expect(isJsonValue(obj)).toEqual(false)
  })
  it('invalidates circular arrays', () => {
    const arr: unknown[] = [1]
    arr.push([arr])
    expect(isJsonValue(arr)).toEqual(false)
  })
  it('validates shared references', () => {
    const shared = { a: 1 }
    expect(isJsonValue({ x: shared, y: [shared, shared] })).toEqual(true)
  })
})
