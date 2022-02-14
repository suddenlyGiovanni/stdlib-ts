import { describe, expect, it, test } from '@jest/globals'
import * as F from '../fuction'

import _, {
  None,
  NoSuchElementException,
  type Option,
  Some,
} from '../option/fluent'

class Utils {
  static readonly string = F.literal('foo')
  static readonly number = 10 as const
  static readonly object = {
    foo: {
      bar: ['baz'],
    },
  } as const

  static double: (n: number) => number = (n) => n * 2

  static fromNumberString: (n: number) => string = (n) => n.toString()

  static fromNumberToString: F.FunctionN<[A: number], string> = (number) =>
    number.toString()

  static aFunctionThatThrows: F.Lazy<never> = () => {
    throw new Error()
  }

  static aFunctionThatDoesntThrow: F.Lazy<number> = () => 1

  static fn: F.Lazy<number> = () => 42
}

describe('Option', () => {
  describe('constructors', () => {
    it('should provide a way to instantiate a `None` instance', () => {
      expect(_.None()).toBeInstanceOf(None)
      expect(_.None()).toStrictEqual(new None())
      expect(_.None().isNone()).toBe(true)
      expect(_.None().isSome()).toBe(false)

      expect(_.apply(null)).toBeInstanceOf(None)
      expect(_.apply(null).isNone()).toBe(true)
      expect(_.apply(null).isSome()).toBe(false)

      expect(_.empty()).toBeInstanceOf(None)
      expect(_.empty().isNone()).toBe(true)
      expect(_.empty().isSome()).toBe(false)
    })

    it('should provide a way to instantiate a `Some` instance', () => {
      expect(_.Some(Utils.string)).toBeInstanceOf(Some)
      expect(_.Some(Utils.number)).toStrictEqual(new Some(Utils.number))
      expect(_.Some(Utils.string).isNone()).toBe(false)
      expect(_.Some(Utils.number).isSome()).toBe(true)

      expect(_.apply(Utils.object)).toBeInstanceOf(Some)
      expect(_.apply(Utils.fn).isNone()).toBe(false)
      expect(_.apply(Utils.object.foo.bar).isSome()).toBe(true)
    })

    test('fromNullable', () => {
      expect(_.fromNullable(2)).toStrictEqual(_.Some(2))
      expect(_.fromNullable(null)).toStrictEqual(_.None())
      expect(_.fromNullable(undefined)).toStrictEqual(_.None())
    })

    test('fromPredicate', () => {
      const predicate: F.Predicate<number> = (n) => n > 2
      const f = _.fromPredicate(predicate)

      expect(f(-1)).toStrictEqual(_.None())
      expect(f(1)).toStrictEqual(_.None())
      expect(f(3)).toStrictEqual(_.Some(3))

      type Direction = 'asc' | 'desc'
      const parseDirection = _.fromPredicate(
        (s: string): s is Direction => s === 'asc' || s === 'desc'
      )
      expect(parseDirection('asc')).toStrictEqual(_.Some('asc'))
      expect(parseDirection('foo')).toStrictEqual(_.None())
    })
  })

  test('isNone', () => {
    expect(_.None().isNone()).toBe(true)
    expect(_.isNone(_.None())).toBe(true)

    expect(_.Some(1).isNone()).toBe(false)
    expect(_.isNone(_.Some(1))).toBe(false)
  })

  test('isSome', () => {
    expect(_.Some(1).isSome()).toBe(true)
    expect(_.isSome(_.Some(1))).toBe(true)

    expect(_.None().isSome()).toBe(false)
    expect(_.isSome(_.None())).toBe(false)
  })

  test('mapNullable', () => {
    interface Employee {
      company?: {
        address?: {
          street?: {
            name?: string
          }
        }
      }
    }

    const employee1: Employee = {
      company: { address: { street: { name: 'high street' } } },
    }
    const employee2: Employee = { company: { address: { street: {} } } }
    const maybeEmployee1Company: Option<NonNullable<Employee['company']>> =
      _.fromNullable(employee1.company)
    const maybeEmployee2Company: Option<NonNullable<Employee['company']>> =
      _.fromNullable(employee2.company)

    expect(
      maybeEmployee1Company
        .mapNullable((company) => company.address)
        .mapNullable((address) => address.street)
        .mapNullable((street) => street.name)
    ).toStrictEqual(_.Some(employee1!.company!.address!.street!.name))

    expect(
      maybeEmployee2Company
        .mapNullable((company) => company.address)
        .mapNullable((address) => address.street)
        .mapNullable((street) => street.name)
    ).toStrictEqual(_.None())
  })

  test('toNullable', () => {
    expect(_.Some(1).toNullable()).toBe(1)
    expect(_.None().toNullable()).toBeNull()
  })

  test('get', () => {
    const string = 'foo' as const
    const number = 10 as const
    const object = {
      foo: {
        bar: ['baz'],
      },
    } as const

    const fn = () => 42
    expect(_.Some(string).get()).toStrictEqual(string)
    expect(_.Some(number).get()).toStrictEqual(number)
    expect(_.Some(object).get()).toStrictEqual(object)
    expect(_.Some(fn).get()).toStrictEqual(fn)
    expect(() => _.None().get()).toThrow(new NoSuchElementException('None.get'))
  })

  test('getOrElse', () => {
    expect(_.Some(1).getOrElse(() => 'zero')).toBe(1)
    expect(_.empty<number>().getOrElse(() => 'zero')).toBe('zero')
  })

  test('getOrElseInv', () => {
    expect(_.Some(1).getOrElseInv(() => 0)).toBe(1)
    expect(_.empty<number>().getOrElseInv(() => 0)).toBe(0)
  })

  test('orNull', () => {
    expect(_.empty<number>().orNull()).toBeNull()
    expect(_.None().orNull()).toBeNull()
    expect(_.Some(1).orNull()).not.toBeNull()
  })

  test('exists', () => {
    const predicate: F.Predicate<number> = (a) => a > 0
    expect(_.Some(1).exists(predicate)).toBe(true)
    expect(_.Some(1).exists((n) => n > 1)).toBe(false)
    expect(_.None().exists(predicate)).toBe(false)
  })

  test('fold', () => {
    const onNone = () => 'a None'
    const onSome = (s: string) => `a Some of length ${s.length}`

    expect(
      _.None().fold(
        () => 'a None',
        // @ts-expect-error asserting unreachable branch
        F.absurd
      )
    ).toBe(onNone())

    expect(
      _.Some('abc').fold(
        // @ts-expect-error asserting unreachable branch
        F.absurd,
        onSome
      )
    ).toBe('a Some of length 3')
  })

  test('map', () => {
    const someA: Some<1> = _.Some(1 as const)
    const someB: Some<'1'> = _.Some(F.literal('1'))

    expect(_.Some(2).map(Utils.double)).toStrictEqual(_.Some(4))
    expect(someA.map(Utils.fromNumberToString)).toStrictEqual(someB)

    const noneA = _.empty<number>()
    expect(_.None().map(Utils.double)).toStrictEqual(_.None())
    expect(noneA.map(Utils.fromNumberToString)).toStrictEqual(_.None())
  })

  test('toUndefined', () => {
    expect(_.Some(1).toUndefined()).toBe(1)
    expect(_.None().toUndefined()).toBeUndefined()
  })

  test('tryCatch', () => {
    expect(_.tryCatch(Utils.aFunctionThatThrows)).toStrictEqual(_.None())
    expect(_.tryCatch(Utils.aFunctionThatDoesntThrow)).toStrictEqual(
      _.Some(Utils.aFunctionThatDoesntThrow())
    )
  })

  it('getRefinement', () => {
    const f = (s: string | number): Option<string> =>
      typeof s === 'string' ? _.Some(s) : _.None()

    const isString = _.getRefinement(f)
    expect(isString('s')).toBe(true)
    expect(isString(1)).toBe(false)
    type A = { readonly type: 'A' }
    type B = { readonly type: 'B' }
    type C = A | B

    const isA = _.getRefinement<C, A>((c) =>
      c.type === 'A' ? _.Some(c) : _.None()
    )
    expect(isA({ type: 'A' })).toBe(true)
    expect(isA({ type: 'B' })).toBe(false)
  })

  test('ap', () => {
    expect(_.Some(2).ap(_.Some(Utils.double))).toStrictEqual(_.Some(4))

    expect(_.Some(2).ap(_.Some(Utils.fromNumberString))).toStrictEqual(
      _.Some('2')
    )

    expect(_.None().ap(_.Some(Utils.double))).toStrictEqual(_.None())

    expect(_.Some(2).ap(_.None())).toStrictEqual(_.None())

    expect(_.None().ap(_.None())).toStrictEqual(_.None())
  })

  it('chain', () => {
    const f = (n: number) => _.Some(n * 2)
    const g = () => _.None()
    expect(_.Some(1).chain(f)).toStrictEqual(_.Some(2))
    expect(_.None().chain(f)).toStrictEqual(_.None())
    expect(_.Some(1).chain(g)).toStrictEqual(_.None())
    expect(_.None().chain(g)).toStrictEqual(_.None())
  })

  test('flatten', () => {
    expect(_.Some(_.Some(1)).flatten()).toStrictEqual(_.Some(1))
    expect(_.Some(_.None()).flatten()).toStrictEqual(_.None())
    expect(_.None().flatten()).toStrictEqual(_.None())
    /**
     * The 'this' context of type 'Some<number>' is not assignable to method's
     * 'this' of type 'Option<Option<unknown>>'. Type 'Some<number>' is not
     * assignable to type 'Some<Option<unknown>>'. Type 'number' is not
     * assignable to type 'Option<unknown>'.
     */
    expect(
      // @ts-expect-error: TS2684:
      _.Some(1).flatten()
    ).toBe(1)
  })
})
