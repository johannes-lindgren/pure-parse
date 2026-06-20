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

// Higher order parsers
import {
  array,
  object,
  oneOf,
  optional,
  withDefault,
  equals,
  map,
  chain,
  recover,
  parserFromGuard,
} from 'pure-parse'

// Higher order guards
import { equalsGuard, objectGuard, arrayGuard, optionalGuard } from 'pure-parse'

// @ts-expect-error -- test that importing something that doesn't exist gives an error
import { abcSomethingThatDoesNotExist } from 'pure-parse'
