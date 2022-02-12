import { describe, expect, test } from '@jest/globals'

import * as F from '../fuction'

describe('core Function module', () => {
  test('Identity function', function () {
    const anyValue = 42

    expect(F.identity(anyValue)).toBe(anyValue)
  })

  test('string literal constructor', () => {
    const fooString = 'foo'
    const fooLiteral = F.literal(fooString)

    expect(fooLiteral).toBe(fooString)
  })

  test('A constant function that always return A', () => {
    const anyVal = 42
    expect(F.constant(anyVal)()).toEqual(anyVal)
  })

  test('hole placeholder function', () => {
    expect(() => F.hole<Map<string, number>>()).toThrow(
      'Hole should never be called'
    )
  })

  test('absurd function will raise if called', () => {
    expect(() => F.absurd('' as never)).toThrow(
      'Called `absurd` function which should be un-callable'
    )
  })

  test('tuple constructor function', () => {
    const foo = 'bar'
    const meaningOfLife = 42

    expect(F.tuple(foo, meaningOfLife)).toStrictEqual([
      foo,
      meaningOfLife,
    ] as const)
  })

  test('predicate', () => {
    const stringQuote =
      "That's one small step for a man, one giant leap for mankind"
    const isOnlyChr: F.Predicate<string> = (str) => !!str.match(/^[A-Z]+$/i)
    const isMoreThan4Chr: F.Predicate<string> = (a) => a.length > 4
    expect(
      stringQuote.split(' ').filter(isOnlyChr).filter(F.not(isMoreThan4Chr))
    ).toStrictEqual(['one', 'step', 'for', 'a', 'one', 'leap', 'for'])
  })

  test('creates a tupled version of this function', () => {
    const add = (x: number, y: number): number => x + y
    const tupledAdd = F.tupled(add)
    const x = 1
    const y = 2
    expect(tupledAdd([x, y])).toBe(add(x, y))
  })
})
