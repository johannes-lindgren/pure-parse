import { describe, it, expect, test } from 'vitest'
import { formatPath, formatResult } from './formatting'
import { object } from './object'
import { array } from './arrays'
import { parseString } from './primitives'
import { success } from './ParseResult'

describe('formatting', () => {
  describe('formatResult', () => {
    describe('success', () => {
      it('starts with "ParseSuccess:"', () => {
        expect(formatResult(success(123))).toMatch(/^ParseSuccess:.*$/)
      })
      it('falls back to Object.prototype.toString()', () => {
        expect(formatResult(success({}))).toEqual(
          'ParseSuccess: [object Object]',
        )
        expect(formatResult(success(new Map()))).toEqual(
          'ParseSuccess: [object Map]',
        )
        expect(formatResult(success(new Set()))).toEqual(
          'ParseSuccess: [object Set]',
        )
        const date = new Date('2025-05-25T01:16:54+02:00')
        expect(formatResult(success(date))).toEqual(
          'ParseSuccess: Sun May 25 2025 01:16:54 GMT+0200 (Central European Summer Time)',
        )
        const error = new Error('Test error')
        expect(formatResult(success(error))).toEqual(
          `ParseSuccess: Error: Test error`,
        )
        expect(formatResult(success([1, 2, 3]))).toEqual('ParseSuccess: 1,2,3')
      })
      it('falls back to "null"', () => {
        expect(formatResult(success(null))).toEqual('ParseSuccess: null')
      })
      it('falls back to "undefined"', () => {
        expect(formatResult(success(undefined))).toEqual(
          'ParseSuccess: undefined',
        )
      })
      it('allows passing a custom toString function', () => {
        expect(
          formatResult(success(123), (value) => `Value: ${value}`),
        ).toEqual('ParseSuccess: Value: 123')
        expect(
          formatResult(success({ name: 'Alice' }), JSON.stringify),
        ).toEqual('ParseSuccess: {"name":"Alice"}')
      })
    })
    describe('formatFailure', () => {
      it('should parse a simple string', () => {
        expect(
          formatResult({
            tag: 'failure',
            error: 'Expected string',
            path: [
              {
                tag: 'object',
                key: 'users',
              },
              {
                tag: 'array',
                index: 2,
              },
              {
                tag: 'object',
                key: 'name',
              },
            ],
          }),
        ).toEqual('ParseFailure: Expected string at $.users[2].name')
      })
      test('empty path', () => {
        expect(
          formatResult({
            tag: 'failure',
            error: 'Expected type string',
            path: [],
          }),
        ).toEqual('ParseFailure: Expected type string')
      })
      test('while parsing', () => {
        const parseDb = object({
          users: array(
            object({
              name: parseString,
              color: parseString,
            }),
          ),
        })
        const result = parseDb({
          users: [
            {
              name: 'Alice',
              color: 'red',
            },
            {
              name: 'Bob',
              color: 123,
            },
          ],
        })
        if (result.tag === 'success') {
          throw new Error('Expected failure')
        }
        expect(formatResult(result)).toEqual(
          'ParseFailure: Expected type string at $.users[1].color',
        )
      })
    })
  })

  describe('formatPath', () => {
    test('empty path', () => {
      expect(formatPath([])).toEqual('$')
    })
    describe('object paths', () => {
      test('depth 1', () => {
        expect(formatPath([{ tag: 'object', key: 'users' }])).toEqual('$.users')
      })
      test('depth 2', () => {
        expect(
          formatPath([
            { tag: 'object', key: 'users' },
            { tag: 'object', key: 'name' },
          ]),
        ).toEqual('$.users.name')
      })
      test('depth 3', () => {
        expect(
          formatPath([
            { tag: 'object', key: 'users' },
            { tag: 'object', key: 'name' },
            { tag: 'object', key: 'first' },
          ]),
        ).toEqual('$.users.name.first')
      })
    })
    describe('array paths', () => {
      test('depth 1', () => {
        expect(formatPath([{ tag: 'array', index: 0 }])).toEqual('$[0]')
      })
      test('depth 2', () => {
        expect(
          formatPath([
            { tag: 'array', index: 0 },
            { tag: 'array', index: 0 },
          ]),
        ).toEqual('$[0][0]')
      })
      test('depth 3', () => {
        expect(
          formatPath([
            { tag: 'array', index: 0 },
            { tag: 'array', index: 0 },
            { tag: 'array', index: 0 },
          ]),
        ).toEqual('$[0][0][0]')
      })
      test('different indices', () => {
        expect(
          formatPath([
            { tag: 'array', index: 0 },
            { tag: 'array', index: 1 },
          ]),
        ).toEqual('$[0][1]')
        expect(
          formatPath([
            { tag: 'array', index: 1 },
            { tag: 'array', index: 0 },
          ]),
        ).toEqual('$[1][0]')
        expect(
          formatPath([
            { tag: 'array', index: 1 },
            { tag: 'array', index: 2 },
          ]),
        ).toEqual('$[1][2]')
      })
    })
  })
  test('mixed paths', () => {
    expect(
      formatPath([
        { tag: 'object', key: 'users' },
        { tag: 'array', index: 0 },
        { tag: 'object', key: 'name' },
      ]),
    ).toEqual('$.users[0].name')
    expect(
      formatPath([
        { tag: 'object', key: 'users' },
        { tag: 'array', index: 0 },
        { tag: 'object', key: 'name' },
        { tag: 'object', key: 'first' },
      ]),
    ).toEqual('$.users[0].name.first')
  })
})
