import { memoizeValidatorConstructor } from './memo'
import {
  array,
  // nonEmptyArray,
  object,
  // partialRecord,
  // record,
  // tuple,
  oneOf,
} from '../parsers'

export const unionMemo = memoizeValidatorConstructor(oneOf)
export const objectMemo = memoizeValidatorConstructor(object)
// TODO export const recordMemo = memoizeValidatorConstructor(record)
// TODO export const partialRecordMemo =  memoizeValidatorConstructor(partialRecord)
// TODO export const tupleMemo = memoizeValidatorConstructor(tuple)
export const arrayMemo = memoizeValidatorConstructor(array)
// TODO export const nonEmptyArrayMemo = memoizeValidatorConstructor(nonEmptyArray)
