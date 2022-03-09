import { describe, expect, test } from '@jest/globals'

import type { Monoid } from 'src/main'

describe('Monoid', () => {
  const stringMonoid: Monoid<string> = {
    concat: (x, y) => x + y,
    empty: '',
  }

  const integerMonoidSum: Monoid<number> = {
    concat: (a, b) => a + b,
    empty: 0,
  }

  const integerMonoidProduct: Monoid<number> = {
    concat: (a, b) => a * b,
    empty: 1,
  }

  test('Monoid of T Strings', () => {
    const x = 'x'

    expect(stringMonoid.concat(x, stringMonoid.empty)).toBe(x)
    expect(stringMonoid.concat(stringMonoid.empty, x)).toBe(x)
  })

  test('Monoid of T Integer', () => {
    const a = 10

    expect(integerMonoidSum.concat(a, integerMonoidSum.empty)).toBe(a)
    expect(integerMonoidProduct.concat(a, integerMonoidProduct.empty)).toBe(a)

    expect(integerMonoidSum.concat(integerMonoidSum.empty, a)).toBe(a)
    expect(integerMonoidProduct.concat(integerMonoidProduct.empty, a)).toBe(a)
  })
})
