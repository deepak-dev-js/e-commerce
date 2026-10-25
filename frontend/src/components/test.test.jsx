import { expect, test, vi } from 'vitest'

test('mock function basics', () => {
  const getApples = vi.fn()

  // Call it

  // Check it was called
  expect(getApples).toHaveBeenCalled()
  expect(getApples).toHaveBeenCalledTimes(1)

  // By default, a mock returns undefined
  expect(getApples()).toBeUndefined()
})