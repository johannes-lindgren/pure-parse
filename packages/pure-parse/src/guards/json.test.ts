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
})
