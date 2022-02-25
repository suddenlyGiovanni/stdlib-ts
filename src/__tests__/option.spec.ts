/* eslint-disable jest/valid-title,eslint-comments/disable-enable-pair */
import { describe, expect, it, jest, test } from '@jest/globals'

import * as F from '../fuction'

/**
 * @privateRemarks
 *   `_` import is a Scala convention where we want to import all the functions
 *   and methods form a given module to the current scope.
 */
import _ from '../option/fluent'
import * as P from '../option/pipable'
import { pipe } from '../pipe'

import type { Option } from '../option/fluent'

enum OptionAPI {
  fluent = 'fluent API',
  pipable = 'pipable API',
}

class Utils {
  static readonly number = 10 as const

  static readonly object = { foo: { bar: ['baz'] } } as const

  static readonly string = F.literal('foo')

  static readonly aFunctionThatDoesntThrow: F.Lazy<number> = () => 1

  static readonly aFunctionThatThrows: F.Lazy<never> = () => {
    throw new Error()
  }

  static readonly double: (n: number) => number = (n) => n * 2

  static readonly fn: F.Lazy<number> = () => 42

  static readonly fromNumberString: (n: number) => string = (n) => n.toString()

  static readonly fromNumberToString: F.FunctionN<
    readonly [A: number],
    string
  > = (number) => number.toString()
}

describe('Option', () => {
  describe('constructors', () => {
    test('should provide a way to instantiate a `None` instance', () => {
      expect(_.none).toMatchObject({ _tag: 'None' })
      expect(_.none.isNone()).toBe(true)
      expect(_.none.isSome()).toBe(false)

      expect(_.apply(null)).toMatchObject({ _tag: 'None' })
      expect(_.apply(null).isNone()).toBe(true)
      expect(_.apply(null).isSome()).toBe(false)

      expect(_.empty).toMatchObject({ _tag: 'None' })
      expect(_.empty.isNone()).toBe(true)
      expect(_.empty.isSome()).toBe(false)
    })

    test('should provide a way to instantiate a `Some` instance', () => {
      expect(_.some(Utils.string)).toMatchObject({ _tag: 'Some' })
      expect(_.some(Utils.number)).toMatchObject({
        _tag: 'Some',
        value: Utils.number,
      })
      expect(_.some(Utils.string).isNone()).toBe(false)
      expect(_.some(Utils.number).isSome()).toBe(true)

      expect(_.apply(Utils.object)).toMatchObject({ _tag: 'Some' })
      expect(_.apply(Utils.fn).isNone()).toBe(false)
      expect(_.apply(Utils.object.foo.bar).isSome()).toBe(true)
    })

    test('of', () => {
      expect(_.of(1)).toStrictEqual(_.some(1))
      expect(_.of(0)).toStrictEqual(_.some(0))
      expect(_.of(null)).toStrictEqual(_.some(null))
      expect(_.of(undefined)).toStrictEqual(_.some(undefined))
    })

    test('fromNullable', () => {
      expect(_.fromNullable(2)).toStrictEqual(_.some(2))
      expect(_.fromNullable(null)).toStrictEqual(_.none)
      expect(_.fromNullable(undefined)).toStrictEqual(_.none)
    })

    test('fromPredicate', () => {
      const predicate: F.Predicate<number> = (n) => n > 2
      const f = _.fromPredicate(predicate)

      expect(f(-1)).toStrictEqual(_.none)
      expect(f(1)).toStrictEqual(_.none)
      expect(f(3)).toStrictEqual(_.some(3))

      type Direction = 'asc' | 'desc'
      const parseDirection = _.fromPredicate(
        (s: string): s is Direction => s === 'asc' || s === 'desc'
      )
      expect(parseDirection('asc')).toStrictEqual(_.some('asc'))
      expect(parseDirection('foo')).toStrictEqual(_.none)
    })
  })

  describe('isNone', () => {
    test(OptionAPI.fluent, () => {
      expect(_.none.isNone()).toBe(true)
      expect(_.some(1).isNone()).toBe(false)
    })

    test(OptionAPI.pipable, () => {
      expect(P.isNone(_.none)).toBe(true)
      expect(_.isNone(_.none)).toBe(true)

      expect(P.isNone(_.some(1))).toBe(false)
      expect(_.isNone(_.some(1))).toBe(false)
    })
  })

  describe('isSome', () => {
    test(OptionAPI.fluent, () => {
      expect(_.some(1).isSome()).toBe(true)
      expect(_.none.isSome()).toBe(false)
    })

    test(OptionAPI.pipable, () => {
      expect(P.isSome(_.some(1))).toBe(true)
      expect(_.isSome(_.some(1))).toBe(true)

      expect(P.isSome(_.none)).toBe(false)
      expect(_.isSome(_.none)).toBe(false)
    })
  })

  test('mapNullable', () => {
    interface Employee {
      readonly company?: {
        readonly address?: {
          readonly street?: {
            readonly name?: string
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
    ).toStrictEqual(_.some(employee1.company!.address!.street!.name))

    expect(
      maybeEmployee2Company
        .mapNullable((company) => company.address)
        .mapNullable((address) => address.street)
        .mapNullable((street) => street.name)
    ).toStrictEqual(_.none)
  })

  test('toNullable', () => {
    expect(_.some(1).toNullable()).toBe(1)
    expect(_.none.toNullable()).toBeNull()
  })

  test('value', () => {
    const string = 'foo' as const
    const number = 10 as const
    const object = {
      foo: {
        bar: ['baz'],
      },
    } as const

    const fn = () => 42
    expect(_.some(string).value).toStrictEqual(string)
    expect(_.some(number).value).toStrictEqual(number)
    expect(_.some(object).value).toStrictEqual(object)
    expect(_.some(fn).value).toStrictEqual(fn)
  })

  test('getOrElse', () => {
    expect(_.some(1).getOrElse(() => 0)).toBe(1)
    expect(_.none.getOrElse(() => 0)).toBe(0)
  })

  test('getOrElseW', () => {
    expect(_.some(1).getOrElseW(() => 'zero')).toBe(1)
    expect(_.empty.getOrElseW(() => 'zero')).toBe('zero')
  })

  test('getOrElseInv', () => {
    expect(_.some(F.literal('foo')).getOrElseInv(() => 'bar')).toBe('foo')
    expect(_.empty.getOrElseInv(() => F.literal('bar'))).toBe('bar')
  })

  test('orNull', () => {
    expect(_.empty.orNull()).toBeNull()
    expect(_.none.orNull()).toBeNull()
    expect(_.some(1).orNull()).not.toBeNull()
  })

  describe('exists', () => {
    const predicate: F.Predicate<number> = (a) => a > 0

    test(OptionAPI.fluent, () => {
      expect(_.some(1).exists(predicate)).toBe(true)
      expect(_.some(1).exists((n) => n > 1)).toBe(false)
      expect(_.none.exists(predicate)).toBe(false)
    })

    test(OptionAPI.pipable, () => {
      expect(pipe(P.exists(predicate))(_.some(1))).toBe(true)
      expect(_.exists(predicate)(_.some(1))).toBe(true)

      expect(pipe(P.exists((n: number) => n > 1))(_.some(1))).toBe(false)
      expect(_.exists((n: number) => n > 1)(_.some(1))).toBe(false)

      expect(pipe(P.exists(predicate))(_.none)).toBe(false)
      expect(_.exists(predicate)(_.none)).toBe(false)
    })
  })

  test('contains', () => {
    expect(_.some('something').contains('something')).toBe(true)
    expect(_.some('something').contains('anything')).toBe(false)
    expect(_.none.contains('anything')).toBe(false)
  })

  describe('fold / foldW / match', () => {
    const onNone: F.Lazy<string> = () => 'a None'
    const onSomeW: (a: string) => number = (s) => s.length
    const onSome: (a: string) => string = (s) => `a Some of length ${s.length}`

    test(OptionAPI.fluent, () => {
      expect(
        _.none.fold(
          () => 'a None',
          // @ts-expect-error asserting unreachable branch
          F.absurd
        )
      ).toBe(onNone())

      expect(_.none.matchW(onNone, onSomeW)).toBe(onNone())

      expect(
        _.some('abc').fold(
          // @ts-expect-error asserting unreachable branch
          F.absurd,
          onSome
        )
      ).toBe('a Some of length 3')
      expect(_.some('abc').foldW(onNone, onSomeW)).toBe(3)

      expect(_.some('abc').matchW(onNone, onSome)).toBe('a Some of length 3')
    })

    test(OptionAPI.pipable, () => {
      expect(
        P.fold(
          () => 'a None',
          // @ts-expect-error asserting unreachable branch
          F.absurd
        )(_.none)
      ).toBe(onNone())

      expect(P.foldW(onNone, onSomeW)(_.none)).toBe(onNone())

      expect(
        P.fold(
          // @ts-expect-error asserting unreachable branch
          F.absurd,
          onSome
        )(_.some('abc'))
      ).toBe('a Some of length 3')

      expect(P.foldW(onNone, onSomeW)(_.some('abc'))).toBe(3)
    })
  })

  test('map', () => {
    const someA: Option<1> = _.some(1 as const)
    const someB: Option<'1'> = _.some(F.literal('1'))

    expect(_.some(2).map(Utils.double)).toStrictEqual(_.some(4))
    expect(someA.map(Utils.fromNumberToString)).toStrictEqual(someB)

    const noneA = _.empty
    expect(_.none.map(Utils.double)).toStrictEqual(_.none)
    expect(noneA.map(Utils.fromNumberToString)).toStrictEqual(_.none)
  })

  test('toUndefined', () => {
    expect(_.some(1).toUndefined()).toBe(1)
    expect(_.none.toUndefined()).toBeUndefined()
  })

  test('tryCatch', () => {
    expect(_.tryCatch(Utils.aFunctionThatThrows)).toStrictEqual(_.none)
    expect(_.tryCatch(Utils.aFunctionThatDoesntThrow)).toStrictEqual(
      _.some(Utils.aFunctionThatDoesntThrow())
    )
  })

  test('getRefinement', () => {
    const f = (s: string | number): Option<string> =>
      typeof s === 'string' ? _.some(s) : _.none

    const isString = _.getRefinement(f)
    expect(isString('s')).toBe(true)
    expect(isString(1)).toBe(false)
    type A = { readonly type: 'A' }
    type B = { readonly type: 'B' }
    type C = A | B

    const isA = _.getRefinement<C, A>((c) =>
      c.type === 'A' ? _.some(c) : _.none
    )
    expect(isA({ type: 'A' })).toBe(true)
    expect(isA({ type: 'B' })).toBe(false)
  })

  test('ap', () => {
    expect(_.some(2).ap(_.some(Utils.double))).toStrictEqual(_.some(4))

    expect(_.some(2).ap(_.some(Utils.fromNumberString))).toStrictEqual(
      _.some('2')
    )

    expect(_.none.ap(_.some(Utils.double))).toStrictEqual(_.none)

    expect(_.some(2).ap(_.none)).toStrictEqual(_.none)

    expect(_.none.ap(_.none)).toStrictEqual(_.none)
  })

  describe('flatMap / chain', () => {
    const double: (a: number) => Option<number> = (n) => _.some(n * 2)
    const square: (a: number) => Option<number> = (n) => _.some(Math.pow(n, 2))

    const g: (a: number) => Option<number> = () => _.none

    test(OptionAPI.fluent, () => {
      const program = <A extends number>(ma: Option<A>) =>
        ma
          .flatMap(double) //
          .chain(square) // we are also testing the alias

      expect(program(_.some(1))).toStrictEqual(_.some(4))
      expect(program(_.none)).toStrictEqual(_.none)
      expect(program(_.some(1)).flatMap(g)).toStrictEqual(_.none)
      expect(program(_.none).flatMap(g)).toStrictEqual(_.none)
    })

    test(OptionAPI.pipable, () => {
      const program = pipe(
        P.flatMap(double),
        _.flatMap((x: number) => _.some(x)), // identity
        _.chain(square)
      )

      expect(program(_.some(1))).toStrictEqual(_.some(4))
      expect(program(_.none)).toStrictEqual(_.none)
      expect(pipe(P.flatMap(g), program)(_.some(1))).toStrictEqual(_.none)
      expect(pipe(_.chain(g), program)(_.none)).toStrictEqual(_.none)
    })
  })

  describe('flatten', () => {
    test(OptionAPI.fluent, () => {
      expect(_.some(_.some(1)).flatten()).toStrictEqual(_.some(1))
      expect(_.some(_.none).flatten()).toStrictEqual(_.none)
      expect(_.none.flatten()).toStrictEqual(_.none)
      /**
       * The 'this' context of type `Some<number>` is not assignable to method's
       * 'this' of type `Option<Option<unknown>>`. Type 'Some<number>' is not
       * assignable to type `Some<Option<unknown>>`. Type 'number' is not
       * assignable to type `Option<unknown>`.
       */
      expect(
        // @ts-expect-error: TS2684:
        _.some(1).flatten()
      ).toBe(1)
    })

    it(OptionAPI.pipable, () => {
      const maybeMaybeA = _.some(_.some(1))

      expect(P.compact(maybeMaybeA)).toStrictEqual(_.some(1))
      expect(_.flatten(maybeMaybeA)).toStrictEqual(_.some(1))

      expect(P.compact(_.some(_.none))).toStrictEqual(_.none)
      expect(_.flatten(_.none)).toStrictEqual(_.none)
    })
  })

  test('zip', () => {
    expect(_.some('foo').zip(_.some('bar'))).toStrictEqual(
      _.some(['foo', 'bar'])
    )
    expect(_.some('foo').zip(_.none)).toStrictEqual(_.none)
    expect(_.none.zip(_.some('bar'))).toStrictEqual(_.none)
    expect(_.none.zip(_.none)).toStrictEqual(_.none)
  })

  test('unzip', () => {
    // testSomeUnzipToSomePair
    expect(
      _.some(F.tuple(F.literal('foo'), F.literal('bar'))).unzip()
    ).toStrictEqual(F.tuple(_.some('foo'), _.some('bar')))
    // testSomeUnzipToSomeNone
    expect(_.some(F.tuple(F.literal('foo'), null)).unzip()).toStrictEqual(
      F.tuple(_.some('foo'), _.some(null))
    )
    // testNoneUnzipToNonePair
    expect(_.none.unzip()).toStrictEqual(F.tuple(_.none, _.none))
  })

  test('unzip3', () => {
    //    testSomeUnzip3ToSomeTriple
    expect(_.some(F.tuple('foo', 'bar', 'z')).unzip3()).toStrictEqual(
      F.tuple(_.some('foo'), _.some('bar'), _.some('z'))
    )
    expect(_.some(F.tuple('foo', null, null)).unzip3()).toStrictEqual(
      F.tuple(_.some('foo'), _.some(null), _.some(null))
    )
    expect(_.none.unzip3()).toStrictEqual(F.tuple(_.none, _.none, _.none))
  })

  describe('filter', () => {
    type Int = number & { readonly _tag: 'Int' }
    const isInteger: F.Refinement<number, Int> = (a): a is Int =>
      Number.isInteger(a)
    const isPositive: F.Predicate<Int> = (a) => a > 0
    const isEven: F.Predicate<Int> = (a) => a % 2 === 0
    const isEqualTo2: F.Predicate<Int> = (a) => a === 2

    test(OptionAPI.fluent, () => {
      const program = (fa: Option<number>): Option<Int> =>
        fa
          .filter(isInteger)
          .filter(isPositive)
          .filter(isEven)
          .filter(isEqualTo2)
      expect(program(_.none)).toStrictEqual(_.none)
      expect(program(_.some(1))).toStrictEqual(_.none)
      expect(program(_.some(2))).toStrictEqual(_.some(2))
    })

    test(OptionAPI.pipable, () => {
      const program = pipe(
        P.filter(isInteger),
        _.filter(isPositive),
        P.filter(isEven),
        _.filter(isEqualTo2)
      )
      expect(program(_.none)).toStrictEqual(_.none)
      expect(program(_.some(1))).toStrictEqual(_.none)
      expect(program(_.some(2))).toStrictEqual(_.some(2))
    })
  })

  describe('filterNot', function () {
    const isPositive: F.Predicate<number> = (a) => a > 0
    const isEven: F.Predicate<number> = (a) => a % 2 === 0
    const isEqualTo2: F.Predicate<number> = (a) => a === 2

    test(OptionAPI.fluent, () => {
      const program = <A extends number>(fa: Option<A>): Option<A> =>
        fa
          .filterNot(isEven) //
          .filterNot(isPositive) //
          .filterNot(isEqualTo2) //

      expect(program(_.none)).toStrictEqual(_.none)
      expect(program(_.some(-0.1))).toStrictEqual(_.some(-0.1))
      expect(program(_.some(2))).toStrictEqual(_.none)
    })

    test(OptionAPI.pipable, () => {
      const program = pipe(
        P.filterNot(isEven),
        _.filterNot(isPositive), // here we are testing that also the static method behaves accordingly
        P.filterNot(isEqualTo2)
      )
      expect(program(_.none)).toStrictEqual(_.none)
      expect(program(_.some(-1))).toStrictEqual(_.some(-1))
      expect(program(_.some(2))).toStrictEqual(_.none)
    })
  })

  test('tap', () => {
    const mockSideEffect = jest.fn(<A>(a: A): void => console.log(a))
    expect(_.some(1).tap(mockSideEffect)).toStrictEqual(_.some(1))
    expect(mockSideEffect).toHaveBeenCalledTimes(1)
    expect(mockSideEffect).toHaveBeenCalledWith(1)

    expect(_.none.tap(mockSideEffect)).toStrictEqual(_.none)
    expect(mockSideEffect).toHaveBeenCalledTimes(1)
  })

  test('toString', () => {
    expect(_.none.toString()).toBe(`None`)
    expect(_.some('a').toString()).toBe('Some("a")')
    expect(_.some(1).toString()).toBe('Some(1)')
    expect(_.some([1, 2, 3]).toString()).toBe('Some([1,2,3])')
    expect(_.some({ foo: 'bar' }).toString()).toBe('Some({"foo":"bar"})')
    expect(_.some(Utils.double).toString()).toBe(`Some(undefined)`) // FIXME: Why???

    expect(_.some(1).valueOf()).toBe(1)
    expect(_.some(Utils.double).valueOf()).toMatchInlineSnapshot(`[Function]`)
  })

  test('toList', () => {
    expect(_.some(1).toList()).toStrictEqual([1])
    expect(_.some([1, 2, 3, 4]).toList()).toStrictEqual([[1, 2, 3, 4]])
    expect(_.none.toList()).toStrictEqual([])
    expect(
      _.apply({ foo: { bar: 'baz' } })
        .toList()
        .map((value): string => value.foo.bar.toUpperCase())
    ).toStrictEqual(['BAZ'])
  })

  test('isEmpty', () => {
    expect(_.none.isEmpty()).toBe(true)
    expect(_.some(Utils.object).isEmpty()).toBe(false)
  })

  test('isDefined', () => {
    expect(_.none.isDefined).toBe(false)
    expect(_.some(Utils.string).isDefined).toBe(true)
  })

  test('knownSize', () => {
    expect(_.some(Utils.fn).knownSize).toBe(1)
    expect(_.none.knownSize).toBe(0)
  })

  test('nonEmpty', () => {
    expect(_.some(Utils.fn).nonEmpty()).toBe(true)
    expect(_.none.nonEmpty()).toBe(false)
  })

  test('orElse', () => {
    expect(_.none.orElse(() => _.some(Utils.object))).toStrictEqual(
      _.some(Utils.object)
    )

    expect(_.some<number>(Utils.number).orElse(() => _.some(42))).toStrictEqual(
      _.some(Utils.number)
    )

    expect(_.some<number>(Utils.number).orElse(() => _.none)).toStrictEqual(
      _.some(Utils.number)
    )
  })

  test('forEach', () => {
    const actual: number[] = []

    // act 1
    _.none.forEach((x: number) => actual.push(x))

    // assert 1
    expect(actual).toStrictEqual([])

    // act 2
    _.some(Utils.number).forEach((n) => actual.push(n))

    // assert 2
    expect(actual).toContainEqual(Utils.number)
  })

  describe('forall', () => {
    const isEven: F.Predicate<number> = (x: number) => x % 2 === 0

    test(OptionAPI.fluent, () => {
      expect(_.none.forall(isEven)).toBe(true)
      expect(_.some(Utils.number).forall(isEven)).toBe(true)
      expect(_.some(9).forall(isEven)).toBe(false)
    })

    test(OptionAPI.pipable, () => {
      expect(P.forall(isEven)(_.none)).toBe(true)
      expect(P.forall(isEven)(_.some(Utils.number))).toBe(true)
      expect(_.forall(isEven)(_.some(9))).toBe(false)
    })
  })

  test('unless', () => {
    const f: F.Lazy<string> = () => 'bar'
    expect(_.unless(true)(f)).toStrictEqual(_.none)
    expect(_.unless(false)(f)).toStrictEqual(_.some(f()))
  })

  test('when', () => {
    const f: F.Lazy<string> = () => 'foo'
    expect(_.when(true)(f)).toStrictEqual(_.some(f()))
    expect(_.when(false)(f)).toStrictEqual(_.none)
  })

  test('toStringTag', () => {
    expect(_[Symbol.toStringTag]).toBe('Option')
  })

  test('equals', () => {
    const maybe1 = _.of(1)
    // check with strict equality (referential identity)
    expect(_.equals(_.none, _.none)).toBe(true)
    expect(_.none.equals(_.none)).toBe(true)

    expect(_.equals(maybe1, maybe1)).toBe(true)
    expect(maybe1.equals(maybe1)).toBe(true)

    // check for behaviour for correctness of the `true` branch
    expect(_.equals(_.some(1), _.some(1))).toBe(true)
    expect(_.some(1).equals(_.some(1))).toBe(true)

    expect(_.equals(maybe1, _.some(1))).toBe(true)
    expect(maybe1.equals(_.some(1))).toBe(true)

    expect(_.equals(_.some(1), maybe1)).toBe(true)
    expect(_.some(1).equals(maybe1)).toBe(true)

    // check for behaviour for correctness of the `false` branch
    expect(_.equals(_.none, _.some(1))).toBe(false)
    expect(_.none.equals(_.some(1))).toBe(false)

    expect(_.equals(_.some(1), _.none)).toBe(false)
    expect(_.some(1).equals(_.none)).toBe(false)

    expect(_.equals(maybe1, _.some(2))).toBe(false)
    expect(maybe1.equals(_.some(2))).toBe(false)
  })
})
