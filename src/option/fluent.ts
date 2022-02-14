/**
 * ```ts
 * type Option<A> = None | Some<A>
 * ```
 *
 * `Option<A>` is a container for an optional value of type `A`. If the value of
 * type `A` is present, the `Option<A>` is an instance of `Some<A>`, containing
 * the present value of type `A`. If the value is absent, the `Option<A>` is an
 * instance of `None`.
 *
 * An option could be looked at as a collection or foldable structure with
 * either one or zero elements. Another way to look at `Option` is: it
 * represents the effect of a possibly failing computation.
 */
import * as F from '../fuction'
import * as T from './model'

export type Option<A> = None | Some<A>

export default abstract class AbstractOption<A = unknown> {
  abstract readonly _tag: 'None' | 'Some'
  /**
   * Returns a singleton iterator returning the Option's value if it is
   * nonempty, or an empty iterator if the option is empty.
   */

  // abstract iterator: Iterator<A>

  /** Constructs `Some(A)` */
  static Some<A>(value: A): Some<A> {
    return new Some(value)
  }

  /**
   * Returns `true` if the option is an instance of `Some`, `false` otherwise.
   *
   * @example
   *   assert.strictEqual(O.isSome(O.Some(1)), true)
   *   assert.strictEqual(O.isSome(O.None()), false)
   */
  static isSome<A>(fa: Option<A>): fa is Some<A> {
    return fa._tag === 'Some'
  }

  /** Constructs `None` */
  static None(): None {
    return new None()
  }

  /**
   * Returns `true` if the option is `None`, `false` otherwise.
   *
   * @example
   *   assert.strictEqual(O.isNone(O.Some(1)), false)
   *   assert.strictEqual(O.isNone(O.None()), true)
   */
  static isNone(fa: Option<unknown>): fa is None {
    return fa._tag === 'None'
  }

  /**
   * An Option factory which creates Some(x) if the argument is not null, and
   * None if it is null.
   *
   * @param x – the value
   * @returns Some(value) if value != null, None if value == null
   */
  static apply<T>(x: T): Option<T> {
    return x !== null
      ? new Some(x) //
      : new None()
  }

  /**
   * Constructs a new `Option` from a nullable type. If the value is `null` or
   * `undefined`, returns `None`, otherwise returns the value wrapped in a `Some`
   *
   * @example
   *   assert.deepStrictEqual(Option.fromNullable(undefined), None)
   *   assert.deepStrictEqual(Option.fromNullable(null), None)
   *   assert.deepStrictEqual(Option.fromNullable(1), Some(1))
   */
  static fromNullable<A>(a: A): Option<NonNullable<A>> {
    return a == null
      ? new None() //
      : new Some(a as NonNullable<A>)
  }

  /**
   * Returns a smart constructor based on the given predicate
   *
   * @example
   *   const getOption = Option.fromPredicate((n: number) => n >= 0)
   *
   *   assert.deepStrictEqual(getOption(-1), Option.None())
   *   assert.deepStrictEqual(getOption(1), Option.Some(1))
   */
  static fromPredicate<A, B extends A>(
    refinement: F.Refinement<A, B>
  ): (a: A) => Option<B>
  static fromPredicate<A>(predicate: F.Predicate<A>): (a: A) => Option<A>
  static fromPredicate<A>(predicate: F.Predicate<A>): (a: A) => Option<A> {
    return (a) => (predicate(a) ? new Some(a) : new None())
  }

  /**
   * An Option factory which returns None in a manner consistent with the
   * collections hierarchy.
   */
  static empty<A>(): Option<A> {
    return new None()
  }

  /**
   * When a given condition is true, evaluates the a argument and returns
   * Some(a). When the condition is false, a is not evaluated and None is returned.
   *
   * @param cond A boolean condition
   */
  static when<T>(cond: boolean): (a: () => T) => Option<T> {
    return (a) =>
      cond
        ? new Some(a()) //
        : new None()
  }

  /**
   * Unless a given condition is true, this will evaluate the `a` argument and
   * return Some(a). Otherwise, `a` is not evaluated and None is returned.
   *
   * @param cond A boolean condition
   * @returns A f from lazy<T> to Option<T>
   */
  static unless<T>(cond: boolean): (a: () => T) => Option<T> {
    return (a) =>
      !cond
        ? new Some(a()) //
        : new None()
  }

  /**
   * Transforms an exception into an `Option`. If `f` throws, returns `None`,
   * otherwise returns the output wrapped in `Some`
   *
   * @example
   *   assert.deepStrictEqual(
   *     tryCatch(() => {
   *       throw new Error()
   *     }),
   *     new None()
   *   )
   *
   *   assert.deepStrictEqual(
   *     tryCatch(() => 1),
   *     new Some(1)
   *   )
   */
  static tryCatch<A>(f: F.Lazy<A>): Option<A> {
    try {
      return new Some(f())
    } catch (e: unknown) {
      return new None()
    }
  }

  /**
   * Returns a `Refinement` (i.e. a custom type guard) from a `Option` returning
   * function. This function ensures that a custom type guard definition is type-safe.
   *
   * ```ts
   * type A = { type: 'A' }
   * type B = { type: 'B' }
   * type C = A | B
   *
   * const isA = (c: C): c is A => c.type === 'B' // <= typo but typescript doesn't complain
   * const isA = getRefinement<C, A>((c) =>
   *   c.type === 'B' ? some(c) : none
   * ) // static error: Type '"B"' is not assignable to type '"A"'
   * ```
   */
  static getRefinement<A, B extends A>(
    getOption: (a: A) => Option<B>
  ): F.Refinement<A, B> {
    return (a: A): a is B => AbstractOption.isSome(getOption(a))
  }

  /**
   * Returns `true` if the option is `None`, `false` otherwise
   *
   * @example
   *   assert.strictEqual(Option.Some(1).isNone(), false)
   *   assert.strictEqual(Option.None.isNone(), true)
   */
  public isNone(this: Option<A>): this is None {
    return AbstractOption.isNone(this)
  }

  /**
   * Returns `true` if the option is an instance of `Some`, `false` otherwise
   *
   * @example
   *   assert.strictEqual(isSome(some(1)), true)
   *   assert.strictEqual(isSome(none), false)
   */
  public isSome(this: Option<A>): this is Some<A> {
    return AbstractOption.isSome(this)
  }

  /** Returns true if the option is INone, false otherwise. */
  public isEmpty<A>(this: Option<A>): this is None {
    return this instanceof None && this.isNone()
  }

  /** Returns true if the option is an instance of Some, false otherwise. */
  public isDefined(this: Option<A>): boolean {
    return this instanceof Some && !this.isEmpty()
  }

  public knownSize(this: Option<A>): 0 | 1 {
    return (this instanceof Some || this instanceof None) && this.isEmpty()
      ? 0
      : 1
  }

  /** Returns the option's value throw an exception if the option is empty */
  abstract get(): A

  /**
   * Returns the option's value if the option is nonempty, otherwise return the
   * result of evaluating default.
   */
  public getOrElse<A, B>(this: Option<A>, onNone: () => B): A | B {
    return this.isNone()
      ? onNone() //
      : this.get() //
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns
   * the given default value
   *
   * This is the specialized invariant version of getOrElse
   *
   * @see getOrElse
   */
  public getOrElseInv<A>(this: Option<A>, onNone: () => A): A {
    return this.getOrElse(onNone)
  }

  /**
   * Returns the option's value if it is nonempty, or null if it is empty.
   * Although the use of null is discouraged, code written to use Option must
   * often interface with code that expects and returns nulls.
   */
  public orNull<A>(this: Option<A>): A | null {
    return this.getOrElse(() => null)
  }

  /**
   * Returns a Some containing the result of applying f to this Option's value
   * if this Option is nonempty. Otherwise, return INone.
   *
   * @param f - The function to apply
   * @note This is similar to flatMap except here, f does not need to wrap its result in an Option.
   * @see also: flatMap
   * @see also: forEach
   */
  public map<A, B>(this: Option<A>, f: (a: A) => B): Option<B> {
    return this.isNone()
      ? new None() //
      : new Some<B>(f(this.get())) //
  }

  /**
   * This is `chain` + `fromNullable`, useful when working with optional values
   *
   * @example
   *   interface Employee {
   *     company?: {
   *       address?: {
   *         street?: {
   *           name?: string
   *         }
   *       }
   *     }
   *   }
   *
   *   const employee1: Employee = {
   *     company: { address: { street: { name: 'high street' } } },
   *   }
   *
   *   assert.deepStrictEqual(
   *     pipe(
   *       fromNullable(employee1.company),
   *       mapNullable((company) => company.address),
   *       mapNullable((address) => address.street),
   *       mapNullable((street) => street.name)
   *     ),
   *     some('high street')
   *   )
   *
   *   const employee2: Employee = { company: { address: { street: {} } } }
   *
   *   assert.deepStrictEqual(
   *     pipe(
   *       fromNullable(employee2.company),
   *       mapNullable((company) => company.address),
   *       mapNullable((address) => address.street),
   *       mapNullable((street) => street.name)
   *     ),
   *     none
   *   )
   */
  public mapNullable<_A, B>(
    this: Option<_A>,
    f: (a: _A) => B | null | undefined
  ): Option<B> {
    return this.isNone()
      ? new None() //
      : AbstractOption.fromNullable(f(this.get()))
  }

  /**
   * Returns the result of applying f to this Option's value if the Option is
   * nonempty. Otherwise, evaluates expression ifEmpty.
   *
   * @param onNone – the expression to evaluate if empty.
   * @param f – the function to apply if nonempty.
   */
  public fold<A, B, C>(
    this: Option<A>,
    onNone: () => B,
    onSome: (a: A) => C
  ): B | C {
    return this.isEmpty()
      ? onNone() //
      : onSome(this.get()) //
  }

  /** Classic applicative */
  public ap<A, B>(this: Option<A>, that: Option<(a: A) => B>): Option<B> {
    return that.isNone()
      ? new None()
      : this.isNone()
      ? new None()
      : new Some(that.get()(this.get()))
  }

  /** Builds a new option constructed using the value of self */
  public chain<A, B>(this: Option<A>, f: (a: A) => Option<B>): Option<B> {
    return this.isNone() ? new None() : f(this.get())
  }

  /**
   * Returns the result of applying f to this Option's value if this Option is
   * nonempty. Returns INone if this Option is empty. Slightly different from
   * map in that f is expected to return an Option (which could be INone)
   *
   * @param f - The function to apply
   * @see also: map
   * @see also: forEach
   */
  public flatMap<B>(this: Option<A>, f: (a: A) => Option<B>): Option<B> {
    return this.isEmpty()
      ? new None() //
      : f(this.get()) //
  }

  /**
   * Returns the nested Option value if it is nonempty. Otherwise, return INone.
   *
   * @example
   *   Some(Some('something')).flatten // INone | Some("something")
   *
   * @see also: flatMap
   */
  public flatten<A>(this: Option<Option<A>>): Option<A> {
    return this.chain(F.identity)
  }

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns true. Otherwise, return INone.
   *
   * @param predicate – the predicate used for testing.
   */
  public filter(this: Option<A>, predicate: (a: A) => boolean): Option<A> {
    return this.isEmpty() || predicate(this.get())
      ? this //
      : new None() //
  }

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns false. Otherwise, return INone.
   *
   * @param predicate – the predicate used for testing.
   */
  public filterNot(this: Option<A>, predicate: (a: A) => boolean): Option<A> {
    return this.isEmpty() || !predicate(this.get())
      ? this //
      : new None() //
  }

  /** Returns false if the option is INone, true otherwise. */
  public nonEmpty(this: Option<A>): boolean {
    return this.isDefined()
  }

  /**
   * Tests whether the option contains a given value as an element.
   *
   * @example
   *   // Returns true because Some instance contains string "something" which equals "something".
   *   Some('something').contains('something')
   *
   *   // Returns false because "something" != "anything".
   *   Some('something').contains('anything')
   *
   *   // Returns false when method called on INone.
   *   INone.contains('anything')
   *
   * @param elem – the element to test.
   * @returns True if the option has an element that is equal (as determined by
   *   ==) to elem, false otherwise.
   */
  public contains<A1 extends A>(this: Option<A>, elem: A1): boolean {
    return !this.isEmpty() && this.get() === elem
  }

  /**
   * Returns true if this option is nonempty and the predicate p returns true
   * when applied to this Option's value. Otherwise, returns false.
   *
   * @param predicate The predicate to test
   */
  public exists<A>(this: Option<A>, predicate: F.Predicate<A>): boolean {
    return this.isNone()
      ? false //
      : predicate(this.get())
  }

  /**
   * Returns a Some containing the result of applying pf to this Option's
   * contained value, if this option is nonempty and pf is defined for that
   * value. Returns INone otherwise.
   *
   * @example
   *   // Returns Some(HTTP) because the partial function covers the case.
   *   Some("http") collect {case "http" => "HTTP"}
   *
   *   // Returns INone because the partial function doesn't cover the case.
   *   Some("ftp") collect {case "http" => "HTTP"}
   *
   *   // Returns INone because the option is empty. There is no value to pass to the partial function.
   *   INone collect {case value => value}
   *
   * @param pf The partial function.
   * @returns The result of applying pf to this Option's value (if possible), or INone.
   */

  // collect<B>(pf: (a: A) => B): Option<B>

  /**
   * Returns true if this option is empty or the predicate p returns true when
   * applied to this Option's value.
   *
   * @param predicate – the predicate to test
   */
  public forall<A>(this: Option<A>, predicate: F.Predicate<A>): boolean {
    return this.isEmpty() || predicate(this.get())
  }

  /**
   * Apply the given procedure f to the option's value, if it is nonempty.
   * Otherwise, do nothing.
   *
   * @param f The procedure to apply.
   * @see also: map
   * @see also: flatMap
   */
  public foreach<A, U>(this: Option<A>, f: (a: A) => U): void {
    if (!this.isEmpty()) {
      f(this.get())
    }
  }

  /**
   * Returns this Option if it is nonempty, otherwise return the result of
   * evaluating alternative.
   *
   * @param alternative – the alternative expression.
   */
  public orElse<A, B extends A>(
    this: Option<A>,
    alternative: () => Option<B>
  ): Option<B> {
    if (this.isEmpty()) {
      return alternative()
    }
    return this as unknown as Option<B> // FIXME: match the types
  }

  /**
   * Returns a Some formed from this option and another option by combining the
   * corresponding elements in a pair. If either of the two options is empty,
   * INone is returned.
   *
   * @example
   *   // Returns Some(("foo", "bar")) because both options are nonempty.
   *   Some('foo').zip(Some('bar'))
   *
   *   // Returns None because `that` option is empty.
   *   Some('foo').zip(None)
   *
   *   // Returns None because `this` option is empty.
   *   None.zip(Some('bar'))
   *
   * @param that The options which is going to be zipped
   */
  public zip<A, B>(
    this: Option<A>,
    that: Option<B>
  ): Option<[_this: A, _that: B]> {
    return this.isEmpty() || that.isEmpty()
      ? new None()
      : new Some([this.get(), that.get()])
  }

  /**
   * Converts an Option of a pair into an Option of the first element and an
   * Option of the second element.
   *
   * @type {A1} – The type of the first half of the element pair
   * @type {A2} – The type of the second half of the element pair
   * @param asPair An implicit conversion which asserts that the element type of
   *   this Option is a pair.
   * @returns A pair of Options, containing, respectively, the first and second
   *   half of the element pair of this Option.
   */
  public unzip<A1, A2>(
    this: Option<A>,
    asPair: (a: A) => [A1, A2]
  ): [Option<A1>, Option<A2>] {
    if (this.isEmpty()) {
      return [new None(), new None()] // FIXME: match to the correct type
    } else {
      const [a1, a2] = asPair(this.get())
      return [new Some(a1), new Some(a2)]
    }
  }

  /**
   * Returns a singleton list containing the Option's value if it is nonempty,
   * or the empty list if the Option is empty.
   */
  public toList<A>(this: Option<A>): Array<A> {
    return this.isEmpty() ? new Array<A>() : [this.get()]
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
   *
   * @example
   *   assert.strictEqual(pipe(some(1), toNullable), 1)
   *   assert.strictEqual(pipe(none, toNullable), null)
   */

  public toNullable<A>(this: Option<A>): A | null {
    return this.isNone() ? null : this.get()
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
   *
   * @example
   *   assert.strictEqual(pipe(some(1), toUndefined), 1)
   *   assert.strictEqual(pipe(none, toUndefined), undefined)
   */
  public toUndefined<A>(this: Option<A>): A | undefined {
    return this.isNone() ? undefined : this.get()
  }

  /**
   * Returns a scala.util.Left containing the given argument left if this Option
   * is empty, or a scala.util.Right containing this Option's value if this is
   * nonempty. This is equivalent to:
   *
   * ```scala
   *  option match {
   *    case Some(x)  => Right(x)
   *    case INone    => Left(left)
   *    }
   * ```
   *
   * @param left The expression to evaluate and return if this is empty
   * @see also: toLeft
   */

  // toRight<X>(left: () => X): Either<X, A>

  /**
   * Returns a scala.util.Right containing the given argument right if this is
   * empty, or a scala.util.Left containing this Option's value if this Option
   * is nonempty. This is equivalent to: option match { case Some(x) => Left(x)
   * case INone => Right(right) }
   *
   * @param right The expression to evaluate and return if this is empty
   * @see also: toRight
   */
  // toLeft<X>(right: () => X): Either<A, X>
}

/** Class Some<A> represents existing values of type A. */

/**
 * This case object represents non-existent values.
 *
 * @internal
 */
export class None extends AbstractOption implements T.None {
  public readonly _tag = 'None' as const

  public get(): never {
    throw new NoSuchElementException('None.get')
  }

  public constructor() {
    super()
  }
}

/**
 * Class Some<A> represents existing values of type A.
 *
 * @internal
 */
export class Some<A> extends AbstractOption<A> implements T.Some<A> {
  public readonly _tag = 'Some' as const
  public readonly value: A

  public get(): A {
    return this.value
  }

  public constructor(value: A) {
    super()
    this.value = value
  }
}

export class NoSuchElementException extends Error {
  constructor(message: string) {
    super(message)
  }
}
