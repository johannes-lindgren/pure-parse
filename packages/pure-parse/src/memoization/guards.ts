import { memoizeValidatorConstructor } from './memo'
import { object } from '../guard'

export const objectGuardMemo = memoizeValidatorConstructor(object)
