import { memoizeValidatorConstructor } from './memo'
import {
  array,
  // nonEmptyArray,
  object,
  // partialRecord,
  // record,
  // tuple,
  union,
} from '../parse'

export const unionMemo = memoizeValidatorConstructor(union)
export const objectMemo = memoizeValidatorConstructor(object)
// TODO export const recordMemo = memoizeValidatorConstructor(record)
// TODO export const partialRecordMemo =  memoizeValidatorConstructor(partialRecord)
// TODO export const tupleMemo = memoizeValidatorConstructor(tuple)
export const arrayMemo = memoizeValidatorConstructor(array)
// TODO export const nonEmptyArrayMemo = memoizeValidatorConstructor(nonEmptyArray)
