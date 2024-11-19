import { memoizeValidatorConstructor } from './memo'
import {
  array,
  object,
  objectCompiled,
  objectStrict,
  objectStrictCompiled,
  oneOf,
  tuple,
} from '../parsers'

export const unionMemo = memoizeValidatorConstructor(oneOf)
export const objectMemo = memoizeValidatorConstructor(object)
export const objectCompiledMemo = memoizeValidatorConstructor(objectCompiled)
export const objectStrictMemo = memoizeValidatorConstructor(objectStrict)
export const objectStrictCompiledMemo =
  memoizeValidatorConstructor(objectStrictCompiled)
// TODO export const recordMemo = memoizeValidatorConstructor(record)
// TODO export const partialRecordMemo =  memoizeValidatorConstructor(partialRecord)
export const tupleMemo = memoizeValidatorConstructor(tuple)
export const arrayMemo = memoizeValidatorConstructor(array)
// TODO export const nonEmptyArrayMemo = memoizeValidatorConstructor(nonEmptyArray)
