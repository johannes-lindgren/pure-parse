import { memoizeValidatorConstructor } from './memo'
import { array, nullable, object, union } from '../parse'

export const unionMemo = memoizeValidatorConstructor(union)
export const nullableMemo = memoizeValidatorConstructor(nullable)
export const objectMemo = memoizeValidatorConstructor(object)
export const arrayMemo = memoizeValidatorConstructor(array)
