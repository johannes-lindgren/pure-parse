// Tests that everthing is exported

// Primitives
import {
  parseString,
  parseNumber,
  parseBoolean,
  parseBigInt,
  parseSymbol,
  parseNull,
  parseUndefined,
  parseUnknown,
  parseNever,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
  isSymbol,
  isArray,
  isObject,
  isUndefined,
  isNull,
  isUnknown,
  isNever,
} from 'pure-parse'

// JSON
import { JsonValue, parseJson, isJsonValue } from 'pure-parse'

// @ts-expect-error -- test that importing something that doesn't exist gives an error
import { abcSomethingThatDoesNotExist } from 'pure-parse'