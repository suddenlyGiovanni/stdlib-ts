import { describe, expect, it } from '@jest/globals'

import type { Semigroup } from 'src/main'

describe('Semigroup', () => {
  const semigroupString: Semigroup<string> = {
    concat: (x, y) => x + y,
  }

  const x = 'x'
  const y = 'y'
  const z = 'z'

  const semigroupIntegerProduct: Semigroup<number> = {
    concat: (a, b) => a * b,
  }

  const a = 2
  const b = 4
  const c = 6

  it('Should obey the Associativity law', () => {
    expect(semigroupString.concat(x, y)).toBe('xy')
    expect(semigroupIntegerProduct.concat(a, b)).toBe(8)

    expect(semigroupString.concat(x, semigroupString.concat(y, z))).toBe('xyz')
    expect(
      semigroupIntegerProduct.concat(a, semigroupIntegerProduct.concat(b, c))
    ).toBe(48)

    expect(semigroupString.concat(semigroupString.concat(x, y), z)).toBe('xyz')
    expect(
      semigroupIntegerProduct.concat(semigroupIntegerProduct.concat(a, b), c)
    ).toBe(48)
  })
})
