import { describe, expect, it } from 'vitest'
import {
  parseBigInt,
  parseBoolean,
  parseNull,
  parseNumber,
  parseString,
  parseSymbol,
  parseUndefined,
} from './primitives'

describe('primitives', () => {
  describe('null', () => {
    it('validates null', () => {
      expect(parseNull(null)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: null,
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseNull(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseNull(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseNull(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseNull(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseNull(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseNull('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseNull(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseNull({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseNull([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseNull(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('undefined', () => {
    it('invalidates null', () => {
      expect(parseUndefined(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates undefined', () => {
      expect(parseUndefined(undefined)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: undefined,
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseUndefined(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseUndefined(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseUndefined(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseUndefined(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseUndefined('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseUndefined(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseUndefined({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseUndefined([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseUndefined(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('boolean', () => {
    it('invalidates null', () => {
      expect(parseBoolean(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseBoolean(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates boolean', () => {
      expect(parseBoolean(true)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: true,
        }),
      )
      expect(parseBoolean(false)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: false,
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseBoolean(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseBoolean(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseBoolean('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseBoolean(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseBoolean({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseBoolean([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseBoolean(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('number', () => {
    it('invalidates null', () => {
      expect(parseNumber(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseNumber(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseNumber(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseNumber(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates number', () => {
      expect(parseNumber(1)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: 1,
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseNumber(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseNumber('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseNumber(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseNumber({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseNumber([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseNumber(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('bigint', () => {
    it('invalidates null', () => {
      expect(parseBigInt(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseBigInt(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseBigInt(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseBigInt(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseBigInt(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates bigint', () => {
      expect(parseBigInt(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: BigInt(1),
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseBigInt('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseBigInt(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseBigInt({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseBigInt([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseBigInt(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('string', () => {
    it('invalidates null', () => {
      expect(parseString(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseString(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseString(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseString(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseString(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseString(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates string', () => {
      expect(parseString('1')).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: '1',
        }),
      )
    })
    it('invalidates symbol', () => {
      expect(parseString(Symbol('1'))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseString({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseString([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseString(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
  describe('symbol', () => {
    it('invalidates null', () => {
      expect(parseSymbol(null)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates undefined', () => {
      expect(parseSymbol(undefined)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates boolean', () => {
      expect(parseSymbol(true)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
      expect(parseSymbol(false)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates number', () => {
      expect(parseSymbol(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates bigint', () => {
      expect(parseSymbol(BigInt(1))).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates string', () => {
      expect(parseSymbol('1')).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('validates symbol', () => {
      const sym = Symbol('1')
      expect(parseSymbol(sym)).toEqual(
        expect.objectContaining({
          tag: 'success',
          value: sym,
        }),
      )
    })
    it('invalidates object', () => {
      expect(parseSymbol({})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates array', () => {
      expect(parseSymbol([])).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
    it('invalidates function', () => {
      expect(parseSymbol(() => {})).toEqual(
        expect.objectContaining({
          tag: 'failure',
        }),
      )
    })
  })
})
