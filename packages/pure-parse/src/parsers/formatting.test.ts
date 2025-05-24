import { describe, it, expect, test } from 'vitest'
import { formatFailure, formatPath } from './formatting'
import { object } from './object'
import { array } from './arrays'
import { parseString } from './primitives'

describe('formatting', () => {
  describe('formatFailure', () => {
    it('should parse a simple string', () => {
      expect(
        formatFailure({
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
      ).toEqual('Expected string at $.users[2].name')
    })
    test('empty path', () => {
      expect(
        formatFailure({
          tag: 'failure',
          error: 'Expected type string',
          path: [],
        }),
      ).toEqual('Expected type string')
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
      expect(formatFailure(result)).toEqual(
        'Expected type string at $.users[1].color',
      )
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
