import { describe, expect, it } from '@jest/globals'
import type { F } from 'ts-toolbelt'

import { pipe } from '../pipe'

describe('pipe', () => {
  it('should pipe two function in expected order', () => {
    const boolToInt = <B extends boolean>(boolean: B): 0 | 1 =>
      boolean ? 1 : 0
    const intToBool = (int: 0 | 1): boolean => int !== 0
    expect(pipe(boolToInt, intToBool)(false)).toBe(false)
    expect(pipe(intToBool, boolToInt)(1)).toBe(1)
  })

  it('should pipe multiple functions while inferring the correct types', () => {
    const a: F.Function<[boolean], 'true' | 'false'> = (boolean) =>
      boolean ? 'true' : 'false'
    const b: F.Function<[string], number> = (str) => str.length
    const c: F.Function<[number], bigint> = (n) => BigInt(n)
    const d: F.Function<[bigint], string> = (bigInt) => bigInt.toString()
    const program = pipe(a, b, c, d)

    expect(program(true)).toBe('4')
  })
})
