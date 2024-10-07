import { describe, it } from 'vitest'
import {
  isBoolean,
  isNumber,
  isString,
  object as objectGuard,
} from '../validate'
import { Infer } from './Infer'
import { Equals } from '../internals'
import { parseBoolean, parseNumber, parseString, object } from '../parse'

describe('Infer', () => {
  it('infers from guards', () => {
    const isUser = objectGuard({
      id: isNumber,
      uid: isString,
      active: isBoolean,
    })
    type User = Infer<typeof isUser>
    const assertion1: Equals<
      User,
      { id: number; uid: string; active: boolean }
    > = true
    const assertion2: Equals<
      User,
      { id: string; uid: string; active: boolean }
    > = false
  })
  it('infers from guards', () => {
    const parseUser = object({
      id: parseNumber,
      uid: parseString,
      active: parseBoolean,
    })
    type User = Infer<typeof parseUser>
    const assertion1: Equals<
      User,
      { id: number; uid: string; active: boolean }
    > = true
    const assertion2: Equals<
      User,
      { id: string; uid: string; active: boolean }
    > = false
  })
})
