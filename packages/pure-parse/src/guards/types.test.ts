import { it } from 'vitest'
import { Guard } from './types'
import { objectGuard } from './object'

it('allows for generic, higher-order validation function', () => {
  type TreeNode<T> = {
    data: T
  }

  const isTreeNode = <T>(
    isData: (data: unknown) => data is T,
  ): Guard<TreeNode<T>> =>
    objectGuard({
      data: isData,
    })
})
