import { memoizeValidatorConstructor } from './memo'
import {
  arrayGuard,
  nonEmptyArrayGuard,
  objectGuard,
  partialRecordGuard,
  recordGuard,
  tupleGuard,
  unionGuard,
} from '../guards'

export const unionGuardMemo = memoizeValidatorConstructor(unionGuard)
export const objectGuardMemo = memoizeValidatorConstructor(objectGuard)
export const recordGuardMemo = memoizeValidatorConstructor(recordGuard)
export const partialRecordGuardMemo =
  memoizeValidatorConstructor(partialRecordGuard)
export const tupleGuardMemo = memoizeValidatorConstructor(tupleGuard)
export const arrayGuardMemo = memoizeValidatorConstructor(arrayGuard)
export const nonEmptyArrayGuardMemo =
  memoizeValidatorConstructor(nonEmptyArrayGuard)
