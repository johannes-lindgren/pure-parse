import { describe, it } from 'vitest'
import { Guard, RequiredGuard } from './Guard'
import { objectGuard } from './object'

describe('Guard', () => {
  it('allows for generic, higher-order validation function', () => {
    type TreeNode<T> = {
      data: T
    }

    const isTreeNode = <T>(isData: RequiredGuard<T>): Guard<TreeNode<T>> =>
      // @ts-expect-error TypeScript gives a false error for the `data` property:
      //  `RequiredGuard` guarantees that `parser` does not represent an optional property yet TypeScript complains
      objectGuard({
        data: isData,
      })
  })
})
