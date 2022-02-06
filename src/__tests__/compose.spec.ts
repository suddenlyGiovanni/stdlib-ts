import { describe, expect, it } from '@jest/globals'
import { compose } from '../compose'

describe('compose', () => {
  function add(x: number): (y: number) => number {
    return (y) => x + y
  }

  function multiply(x: number): (y: number) => number {
    return (y) => x * y
  }

  function divide(divisor: number): (dividend: number) => number {
    if (divisor === 0) throw new Error('divided by 0')
    return (dividend) => dividend / divisor
  }

  const input = 10

  it('should compose two functions', () => {
    const add5andDouble = compose(multiply(2), add(5))
    const expectedOutput = 30

    expect(add5andDouble(input)).toBe(expectedOutput)
  })

  it('should compose multiple functions', () => {
    const add5AndDoubleAndDivideBy3 = compose(
      divide(3),
      multiply(2),
      (s: string) => parseInt(s),
      (a: number): string => a.toPrecision(),
      add(5)
    )

    expect(add5AndDoubleAndDivideBy3(input)).toBe(10)
  })
})
