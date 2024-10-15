import { memoizeValidatorConstructor } from './memo'
import { objectGuard } from '../guard'

export const objectGuardMemo = memoizeValidatorConstructor(objectGuard)
