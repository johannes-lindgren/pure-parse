import { memoizeValidatorConstructor } from './memo'
import {
  arrayGuard,
  nonEmptyArrayGuard,
  objectGuard,
  objectGuardCompiled,
  dictionaryGuard,
  tupleGuard,
  oneOfGuard,
} from '../guards'

export const unionGuardMemo = memoizeValidatorConstructor(oneOfGuard)
export const objectGuardMemo = memoizeValidatorConstructor(objectGuard)
export const objectGuardCompiledMemo =
  memoizeValidatorConstructor(objectGuardCompiled)
export const dictionaryGuardMemo = memoizeValidatorConstructor(dictionaryGuard)
export const tupleGuardMemo = memoizeValidatorConstructor(tupleGuard)
export const arrayGuardMemo = memoizeValidatorConstructor(arrayGuard)
export const nonEmptyArrayGuardMemo =
  memoizeValidatorConstructor(nonEmptyArrayGuard)
