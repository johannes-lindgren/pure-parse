import { describe, expect, it } from 'vitest'
import { parseJson } from './json'
import { object } from './object'
import { parseNumber, parseString } from './primitives'
import { chain } from './Parser'

const expectFailure = () =>
  expect.objectContaining({
    tag: 'failure',
  })

const expectSuccess = <T>(value: T) =>
  expect.objectContaining({
    tag: 'success',
    value,
  })

describe('parseJson', () => {
  describe('non-string input', () => {
    it('invalidates Json values', () => {
      expect(parseJson(undefined)).toEqual(expectFailure())
      expect(parseJson(null)).toEqual(expectFailure())
      expect(parseJson(true)).toEqual(expectFailure())
      expect(parseJson(123)).toEqual(expectFailure())
      expect(parseJson({})).toEqual(expectFailure())
      expect(parseJson([])).toEqual(expectFailure())
    })
    it('invalidates empty strings', () => {
      expect(parseJson('')).toEqual(expectFailure())
    })
    it('invalidates non-quoted strings', () => {
      expect(parseJson('hello')).toEqual(expectFailure())
    })
  })
  describe('valid JSON strings', () => {
    it('validates null', () => {
      expect(parseJson(JSON.stringify(null))).toEqual(expectSuccess(null))
    })
    it('validates boolean', () => {
      expect(parseJson(JSON.stringify(true))).toEqual(expectSuccess(true))
      expect(parseJson(JSON.stringify(false))).toEqual(expectSuccess(false))
    })
    it('validates number', () => {
      expect(parseJson(JSON.stringify(0))).toEqual(expectSuccess(0))
      expect(parseJson(JSON.stringify(42))).toEqual(expectSuccess(42))
      expect(parseJson(JSON.stringify(-42.5))).toEqual(expectSuccess(-42.5))
    })
    it('validates string', () => {
      expect(parseJson(JSON.stringify(''))).toEqual(expectSuccess(''))
      expect(parseJson(JSON.stringify('hello'))).toEqual(expectSuccess('hello'))
      expect(parseJson(JSON.stringify('123'))).toEqual(expectSuccess('123'))
    })
    it('validates object', () => {
      expect(parseJson(JSON.stringify({}))).toEqual(expectSuccess({}))
      expect(parseJson(JSON.stringify({ key: 'value' }))).toEqual(
        expectSuccess({ key: 'value' }),
      )
      expect(
        parseJson(JSON.stringify({ key: 123, nested: { anotherKey: true } })),
      ).toEqual(expectSuccess({ key: 123, nested: { anotherKey: true } }))
    })
    it('validates array', () => {
      expect(parseJson(JSON.stringify([]))).toEqual(expectSuccess([]))
      expect(parseJson(JSON.stringify([1, 'two', true]))).toEqual(
        expectSuccess([1, 'two', true]),
      )
      expect(
        parseJson(JSON.stringify([null, { key: 'value' }, [1, 2, 3]])),
      ).toEqual(expectSuccess([null, { key: 'value' }, [1, 2, 3]]))
    })
  })
  describe('chaining', () => {
    const parseUser = object({
      name: parseString,
      age: parseNumber,
    })
    it('invalidates non-JSON strings', () => {
      expect(chain(parseJson, parseUser)('invalid json string')).toEqual(
        expectFailure(),
      )
    })
    it('parsesStrings', () => {
      const value = 'hello'
      const json = JSON.stringify(value)
      expect(chain(parseJson, parseString)(json)).toEqual(expectSuccess(value))
    })
    it('parses objects', () => {
      const value = {
        name: 'John',
        age: 30,
      }
      const json = JSON.stringify(value)
      expect(chain(parseJson, parseUser)(json)).toEqual(expectSuccess(value))
    })
    it('invalidates non-JSON strings', () => {
      const invalidJson = 'invalid json string'
      expect(chain(parseJson, parseUser)(invalidJson)).toEqual(expectFailure())
    })
  })
})
