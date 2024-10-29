import { memoizeValidatorConstructor } from './memo'
import {
  array,
  // nonEmptyArray,
  object,
  objectCompiled,
  // partialRecord,
  // record,
  // tuple,
  oneOf,
  tuple,
} from '../parsers'

export const unionMemo = memoizeValidatorConstructor(oneOf)
export const objectMemo = memoizeValidatorConstructor(object)
export const objectCompiledMemo = memoizeValidatorConstructor(objectCompiled)
// TODO export const recordMemo = memoizeValidatorConstructor(record)
// TODO export const partialRecordMemo =  memoizeValidatorConstructor(partialRecord)
export const tupleMemo = memoizeValidatorConstructor(tuple)
export const arrayMemo = memoizeValidatorConstructor(array)
// TODO export const nonEmptyArrayMemo = memoizeValidatorConstructor(nonEmptyArray)
