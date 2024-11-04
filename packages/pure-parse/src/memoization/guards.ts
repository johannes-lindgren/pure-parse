import { memoizeValidatorConstructor } from './memo'
import {
  arrayGuard,
  nonEmptyArrayGuard,
  objectGuard,
  objectGuardCompiled,
  partialRecordGuard,
  recordGuard,
  tupleGuard,
  oneOfGuard,
} from '../guards'

export const unionGuardMemo = memoizeValidatorConstructor(oneOfGuard)
export const objectGuardMemo = memoizeValidatorConstructor(objectGuard)
export const objectGuardCompiledMemo =
  memoizeValidatorConstructor(objectGuardCompiled)
export const recordGuardMemo = memoizeValidatorConstructor(recordGuard)
export const partialRecordGuardMemo =
  memoizeValidatorConstructor(partialRecordGuard)
export const tupleGuardMemo = memoizeValidatorConstructor(tupleGuard)
export const arrayGuardMemo = memoizeValidatorConstructor(arrayGuard)
export const nonEmptyArrayGuardMemo =
  memoizeValidatorConstructor(nonEmptyArrayGuard)
