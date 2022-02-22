/**
 * `type Option<A> = None | Some<A>`
 *
 * @remarks
 *   `Option<A>` is a container for an optional value of type `A`. If the value of
 *   type `A` is present, the `Option<A>` is an instance of `Some<A>`,
 *   containing the present value of type `A`. If the value is absent, the
 *   `Option<A>` is an instance of `None`.
 *
 *   An option could be looked at as a collection or foldable structure with
 *   either one or zero elements. Another way to look at `Option` is: it
 *   represents the effect of a possibly failing computation.
 * @packageDocumentation
 */

import * as F from '../fuction'
import * as T from './model'

export default abstract class AbstractOption<A = unknown> {
  abstract readonly _tag: T.Option<unknown>['_tag']

  /**
   * Returns a singleton iterator returning the Option's value if it is
   * nonempty, or an empty iterator if the option is empty.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   */

  // abstract iterator: Iterator<A> // TODO: provide implementation

  /**
   * An Option factory which returns None in a manner consistent with the
   * collections hierarchy.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @category Constructors
   */
  static get empty(): None {
    return None.getInstance()
  }

  /**
   * Constructs `None`
   *
   * @privateRemarks
   *   We use a getter to stream-line the api
   * @category Constructors
   */
  static get none(): None {
    return None.getInstance()
  }

  /**
   * Returns true if the option is an instance of Some, false otherwise.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   */
  abstract get isDefined(): boolean

  /**
   * @remarks
   *   This method is a port of Scala's Option interface.
   */
  abstract get knownSize(): 0 | 1

  /**
   * Marked AbstractOption constructor to be protected to signal to possible
   * consumers that this class is not supposed to be instantiated directly
   */
  protected constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function

  /**
   * An Option factory which creates Some(x) if the argument is not null, and
   * None if it is null.
   *
   * @category Constructors
   * @param x – the value
   * @returns Some(value) if value != null, None if value == null
   *
   *   FIXME: this is Scala specific, It is not a good idea for ts.
   *
   *   TODO: a better static constructor could be `from` or `of` instead
   */
  static apply<T>(x: T): Option<T> {
    return x != null ? new Some(x) : None.getInstance()
  }

  /**
   * Indicates whether two Options are "equal to" oneanoter.
   *
   * @example
   *   assert.strictEqual(_.equals(_.none, _.none), true)
   *   assert.strictEqual(_.equals(_.none, _.some(1)), false)
   *   assert.strictEqual(_.equals(_.some(1), _.none), false)
   *   assert.strictEqual(_.equals(_.some(1), _.some(2)), false)
   *   assert.strictEqual(_.equals(_.some(1), _.some(1)), true)
   *
   * @param x - Option a.
   * @param y - Option b.
   * @returns `true` If this object is the same as the obj argument; `false` otherwise.
   */
  static equals<A>(x: Option<A>, y: Option<A>): boolean {
    return (
      x === y ||
      (AbstractOption.isNone(x)
        ? AbstractOption.isNone(y)
        : AbstractOption.isNone(y)
        ? false
        : x.value === y.value)
    )
  }

  /**
   * Constructs a new `Option` from a nullable type. If the value is `null` or
   * `undefined`, returns `None`, otherwise returns the value wrapped in a `Some`
   *
   * @category Constructors
   * @example
   *   assert.deepStrictEqual(_.fromNullable(undefined), new None())
   *   assert.deepStrictEqual(_.fromNullable(null), new None())
   *   assert.deepStrictEqual(_.fromNullable(1), new Some(1))
   *
   * @param a - An nullable value
   */
  static fromNullable<A>(a: A): Option<NonNullable<A>> {
    return a == null ? None.getInstance() : new Some(a as NonNullable<A>)
  }

  /**
   * Returns a smart constructor based on the given predicate
   *
   * @category Constructors
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
    return (a) => (predicate(a) ? new Some(a) : None.getInstance())
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
   *
   * @param getOption
   */
  static getRefinement<A, B extends A>(
    getOption: (a: A) => Option<B>
  ): F.Refinement<A, B> {
    return (a: A): a is B => AbstractOption.isSome(getOption(a))
  }

  /**
   * Returns `true` if the option is `None`, `false` otherwise.
   *
   * @example
   *   assert.strictEqual(O.isNone(O.Some(1)), false)
   *   assert.strictEqual(O.isNone(O.None()), true)
   *
   * @param fa - An Option instance of type unknown
   * @returns `true` if the option is `None`, `false` otherwise
   */
  static isNone(fa: Option<unknown>): fa is None {
    return fa._tag === 'None'
  }

  /**
   * Returns `true` if the option is an instance of `Some`, `false` otherwise.
   *
   * @example
   *   assert.strictEqual(O.isSome(O.Some(1)), true)
   *   assert.strictEqual(O.isSome(O.None()), false)
   *
   * @param fa
   */
  static isSome<A>(fa: Option<A>): fa is Some<A> {
    return fa._tag === 'Some'
  }

  static of<A>(a: A): Option<A> {
    return new Some(a)
  }

  /**
   * Constructs `Some(A)`
   *
   * @param value - The boxed value
   * @returns A new Some<A> holding the value
   */
  static some<A>(value: A): Some<A> {
    return new Some(value)
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
   *
   * @param f - A lazy function to `A` that might throw an exception
   */
  static tryCatch<A>(f: F.Lazy<A>): Option<A> {
    // eslint-disable-next-line functional/no-try-statement
    try {
      return new Some(f())
    } catch (e: unknown) {
      return None.getInstance()
    }
  }

  /**
   * Unless a given condition is true, this will evaluate the `a` argument and
   * return Some(a). Otherwise, `a` is not evaluated and None is returned.
   *
   * @param cond - A boolean condition
   * @returns A f from lazy<T> to Option<T>
   */
  static unless<A>(cond: boolean): (a: F.Lazy<A>) => Option<A> {
    return AbstractOption.when(!cond)
  }

  /**
   * When a given condition is true, evaluates the a argument and returns
   * Some(a). When the condition is false, a is not evaluated and None is returned.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param cond - A boolean condition
   */
  static when<A>(cond: boolean): (a: F.Lazy<A>) => Option<A> {
    return (a) => (cond ? new Some(a()) : None.getInstance())
  }

  /**
   * Classic applicative
   *
   * @param that - An Option instance holding an f: A => B
   */
  ap<A, B>(this: Option<A>, that: Option<(a: A) => B>): Option<B> {
    return that.isNone()
      ? None.getInstance()
      : this.isNone()
      ? None.getInstance()
      : new Some(that.value(this.value))
  }

  /**
   * Builds a new Option constructed using the value of self
   *
   * @param f - A function from A to Option<B>
   * @see flatMap
   */
  chain<A, B>(this: Option<A>, f: (a: A) => Option<B>): Option<B> {
    return this.flatMap(f)
  }

  /**
   * Tests whether the option contains a given value as an element.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @example
   *   // Returns true because Some instance contains string "something" which equals "something".
   *   _.Some('something').contains('something')
   *
   *   // Returns false because "something" != "anything".
   *   _.Some('something').contains('anything')
   *
   *   // Returns false when method called on None.
   *   _.None.contains('anything')
   *
   * @param elem - The element to test.
   * @returns True if the 2option has an element that is equal (as determined by
   *   ==) to elem, false otherwise.
   */
  contains<A, A1 extends A>(this: Option<A>, elem: A1): boolean {
    return this.isSome() && this.value === elem
  }

  /**
   * Returns true if this option is nonempty and the predicate p returns true
   * when applied to this Option's value. Otherwise, returns false.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param predicate - The predicate to test
   */
  exists<A>(this: Option<A>, predicate: F.Predicate<A>): boolean {
    return this.isNone() ? false : predicate(this.value)
  }

  filter<A, B extends A>(
    this: Option<A>,
    refinement: F.Refinement<A, B>
  ): Option<B>

  filter<A, B extends A>(this: Option<B>, predicate: F.Predicate<A>): Option<B>

  filter<A>(this: Option<A>, predicate: F.Predicate<A>): Option<A>

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns true. Otherwise, return INone.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param predicate – the predicate used for testing.
   */
  filter<A>(this: Option<A>, predicate: F.Predicate<A>) {
    return this.isNone()
      ? None.getInstance()
      : predicate(this.value)
      ? this
      : None.getInstance()
  }

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns false. Otherwise, return None
   *
   * This is in Scala is equivalent to:
   *
   * ```scala
   * option match {
   *   case Some(x) if !p(x) => Some(x)
   *   case _                => None
   * }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param predicate – the predicate used for testing.
   */
  filterNot<A>(this: Option<A>, predicate: F.Predicate<A>): Option<A> {
    return this.isSome() && !predicate(this.value) ? this : None.getInstance()
  }

  /**
   * Returns the result of applying f to this Option's value if this Option is
   * nonempty. Returns INone if this Option is empty. Slightly different from
   * map in that f is expected to return an Option (which could be INone)
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param f - The function to apply
   * @see also: map
   * @see also: forEach chain
   */
  flatMap<A, B>(this: Option<A>, f: (a: A) => Option<B>): Option<B> {
    return this.isNone() ? None.getInstance() : f(this.value)
  }

  /**
   * Returns the nested Option value if it is nonempty. Otherwise, return INone.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @example
   *   _.Some(_.Some('something')).flatten() // None | Some("something")
   *
   * @see also: flatMap
   */
  flatten<A>(this: Option<Option<A>>): Option<A> {
    return this.flatMap(F.identity)
  }

  /**
   * Returns the result of applying f to this Option's value if the Option is
   * nonempty. Otherwise, evaluates expression ifEmpty.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param onNone - The expression to evaluate if empty.
   * @param onSome - The function to apply if nonempty.
   */
  fold<A, B, C>(
    this: Option<A>,
    onNone: F.Lazy<B>,
    onSome: (a: A) => C
  ): B | C {
    return this.isEmpty() ? onNone() : onSome(this.value)
  }

  /**
   * Apply the given procedure `f` to the Option's value, if it is nonempty.
   * Otherwise, do nothing.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param f - The procedure to apply.
   * @see also: map
   * @see also: flatMap
   */
  // eslint-disable-next-line functional/no-return-void
  forEach<A, U>(this: Option<A>, f: (a: A) => U): void {
    if (!this.isEmpty()) f(this.value)
  }

  /**
   * Returns true if this option is empty or the predicate p returns true when
   * applied to this Option's value.
   *
   * This is equivalent to:
   *
   * ```scala
   *  option match {
   *    case Some(x) => p(x)
   *    case None    => true
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param predicate – the predicate to test
   */
  forall<A>(this: Option<A>, predicate: F.Predicate<A>): boolean {
    return this.isNone() || predicate(this.value)
  }

  /**
   * Returns the option's value if the option is nonempty, otherwise return the
   * result of evaluating default.
   *
   * @remarks
   *   This method is a port of Scala's Option interface. This method is a port of
   *   effect-ts system's Option interface.
   * @param onNone - A lazy function that returns a B
   */
  getOrElse<A, B extends A>(this: Option<A>, onNone: F.Lazy<B>): A | B {
    return this.getOrElseW(onNone)
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns
   * the given default value
   *
   * This is the specialized invariant version of getOrElse
   *
   * @param onNone - A lazy function that returns a B
   * @see getOrElse, getOrElseW
   */
  getOrElseInv<A>(this: Option<A>, onNone: F.Lazy<A>): A {
    return this.getOrElse(onNone)
  }

  /**
   * Less strict version of [`getOrElse`](#getorelse).
   *
   * @see getOrElse
   */
  getOrElseW<A, B>(this: Option<A>, onNone: F.Lazy<B>): A | B {
    return this.isNone() ? onNone() : this.value
  }

  /**
   * Returns true if the option is None, false otherwise.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   */
  isEmpty<A>(this: Option<A>): this is None {
    return this.isNone()
  }

  /**
   * Returns `true` if the option is `None`, `false` otherwise
   *
   * @example
   *   assert.strictEqual(Option.Some(1).isNone(), false)
   *   assert.strictEqual(Option.None.isNone(), true)
   */
  isNone(this: Option<A>): this is None {
    return AbstractOption.isNone(this)
  }

  /**
   * Returns `true` if the option is an instance of `Some`, `false` otherwise
   *
   * @example
   *   assert.strictEqual(isSome(some(1)), true)
   *   assert.strictEqual(isSome(none), false)
   */
  isSome(this: Option<A>): this is Some<A> {
    return AbstractOption.isSome(this)
  }

  /**
   * Returns a Some containing the result of applying f to this Option's value
   * if this Option is nonempty. Otherwise, return INone.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param f - The function from A to B to apply
   * @note This is similar to flatMap except here, f does not need to wrap its result in an Option.
   * @see also: flatMap
   * @see also: forEach
   */
  map<A, B>(this: Option<A>, f: (a: A) => B): Option<B> {
    return this.isNone() ? None.getInstance() : new Some<B>(f(this.value))
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
   *
   * @param f - TODO: describe this better
   */
  mapNullable<_A, B>(
    this: Option<_A>,
    f: (a: _A) => B | null | undefined
  ): Option<B> {
    return this.isNone()
      ? None.getInstance()
      : AbstractOption.fromNullable(f(this.value))
  }

  /**
   * Alias for `fold`
   *
   * @param onNone
   * @param onSome
   * @see fold
   */
  match<A, B, C>(
    this: Option<A>,
    onNone: F.Lazy<B>,
    onSome: (a: A) => C
  ): B | C {
    return this.fold(onNone, onSome)
  }

  /**
   * Returns false if the option is INone, true otherwise.
   *
   * This is equivalent to:
   *
   * ```scala
   *  option match {
   *    case Some(_) => true
   *    case None    => false
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   *
   *   This is equivalent in Scala to:
   *
   *   ```scala
   *   option match {
   *    case Some(_) => true
   *    case None    => false
   *   }
   * ```
   *
   *   Note: Implemented here to avoid the implicit conversion to Iterable.
   */
  nonEmpty<A>(this: Option<A>): this is Some<A> {
    return this.isDefined
  }

  /**
   * Returns this Option if it is nonempty, otherwise return the result of
   * evaluating alternative.
   *
   * This is equivalent in Scala to:
   *
   * ```scala
   *  option match {
   *    case Some(x) => Some(x)
   *    case None    => alternative
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param alternative – the alternative expression.
   */
  orElse<A, B extends A>(
    this: Option<A>,
    alternative: F.Lazy<Option<B>>
  ): Option<A> | Option<B> {
    return this.isNone() ? alternative() : this
  }

  /**
   * Returns a Some containing the result of applying pf to this Option's
   * contained value, if this option is nonempty and pf is defined for that
   * value. Returns INone otherwise.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
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
   * @param pf - The partial function.
   * @returns The result of applying pf to this Option's value (if possible), or INone.
   */

  // collect<B>(pf: (a: A) => B): Option<B> // TODO: ADD this implementation

  /**
   * Returns the option's value if it is nonempty, or null if it is empty.
   * Although the use of null is discouraged, code written to use Option must
   * often interface with code that expects and returns nulls.
   *
   * This is equivalent in Scala to:
   *
   * ```scala
   *  option match {
   *    case Some(x) => x
   *    case None    => null
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   */
  orNull<A>(this: Option<A>): A | null {
    return this.getOrElseW(() => null)
  }

  /**
   * Like chain but ignores the constructed output
   *
   * @param f - TODO: add proper description
   */
  tap<A>(this: Option<A>, f: (a: A) => unknown): Option<A> {
    if (this.isSome()) {
      f(this.value)
    }
    return this
  }

  /**
   * Returns a scala.util.Right containing the given argument right if this is
   * empty, or a scala.util.Left containing this Option's value if this Option
   * is nonempty. This is equivalent to:
   *
   * ```scala
   *  option match {
   *    case Some(x)  => Left(x)
   *    case INone    => Right(right)
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param right - The expression to evaluate and return if this is empty
   * @see also: toRight
   */
  // eslint-disable-next-line functional/no-return-void
  toLeft<A, X>(
    this: Option<A>,
    // @ts-expect-error parameter is not used
    right: F.Lazy<X>
  ) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error('Method not yet implemented')
    // TODO: should return a `Either<A, X>`
  }

  /**
   * Returns a singleton list containing the Option's value if it is nonempty,
   * or the empty list if the Option is empty.
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   */
  toList<A>(this: Option<A>): ReadonlyArray<A> {
    return this.isNone() ? ([] as ReadonlyArray<A>) : ([this.value] as const)
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
   *
   * @example
   *   assert.strictEqual(pipe(some(1), toNullable), 1)
   *   assert.strictEqual(pipe(none, toNullable), null)
   */

  toNullable<A>(this: Option<A>): A | null {
    return this.isNone() ? null : this.value
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
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @param left - The expression to evaluate and return if this is empty
   * @see also: toLeft
   */

  // eslint-disable-next-line functional/no-return-void
  toRight<A, X>(
    this: Option<A>,
    // @ts-expect-error parameter is not used
    left: F.Lazy<X>
  ) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error('Method not yet implemented')
    // TODO: should return a `Either<X, A>`
  }

  /**
   * The toString() method returns a string representing the object.
   *
   * @returns A string representing the object.
   */
  toString<A>(this: Option<A>): 'None' | `Some(${string})` {
    if (this.isNone()) {
      return this[Symbol.toStringTag]
    } else {
      return `${this[Symbol.toStringTag]}(${JSON.stringify(this.value)})`
    }
  }

  /**
   * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
   *
   * @example
   *   assert.strictEqual(pipe(some(1), toUndefined), 1)
   *   assert.strictEqual(pipe(none, toUndefined), undefined)
   */
  toUndefined<A>(this: Option<A>): A | undefined {
    return this.isNone() ? undefined : this.value
  }

  /**
   * Converts an Option of a pair into an Option of the first element and an
   * Option of the second element.
   *
   * This is equivalent in Scala to:
   *
   * ```scala
   *   option match {
   *     case Some((x, y)) => (Some(x), Some(y))
   *     case _            => (None,    None)
   *   }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @type {A1} – The type of the first half of the element pair
   * @type {A2} – The type of the second half of the element pair
   * @returns A pair of Options, containing, respectively, the first and second
   *   half of the element pair of this Option.
   */
  unzip<A extends readonly [a1: A1, a2: A2], A1, A2>(
    this: Option<A>
  ): readonly [a1: Option<A1>, a2: Option<A2>] {
    if (this.isNone()) {
      return F.tuple(None.getInstance(), None.getInstance())
    } else {
      const [a1, a2] = this.value
      return F.tuple(new Some(a1), new Some(a2))
    }
  }

  /**
   * Converts an Option of a triple into three Options, one containing the
   * element from each position of the triple.
   *
   * This in scala is equivalent to:
   *
   * ```scala
   *  option match {
   *    case Some((x, y, z))      => (Some(x), Some(y), Some(z))
   *    case _                    => (None, None, None)
   *  }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @type {A1} - The type of the first of three elements in the triple
   * @type {A2} - The type of the second of three elements in the triple
   * @type {A3} - The type of the third of three elements in the triple
   * @returns A triple of Options, containing, respectively, the first, second,
   *   and third elements from the element triple of this Option.
   */
  unzip3<A extends readonly [a1: A1, a2: A2, a3: A3], A1, A2, A3>(
    this: Option<A>
  ): readonly [Option<A1>, Option<A2>, Option<A3>] {
    if (this.isNone()) {
      return [None.getInstance(), None.getInstance(), None.getInstance()]
    } else {
      const [a1, a2, a3] = this.value
      return [new Some(a1), new Some(a2), new Some(a3)] as const
    }
  }

  valueOf<A>(this: Option<A>): A {
    return this.isSome() ? this.value : (null as unknown as A)
  }

  /**
   * Returns a Some formed from this option and another option by combining the
   * corresponding elements in a pair. If either of the two options is empty,
   * None is returned.
   *
   * This is equivalent in Scala to:
   *
   * ```scala
   *   (option1, option2) match {
   *     case (Some(x), Some(y)) => Some((x, y))
   *     case _                  => None
   *   }
   * ```
   *
   * @remarks
   *   This method is a port of Scala's Option interface.
   * @example
   *   // Returns Some(("foo", "bar")) because both options are nonempty.
   *   _.Some('foo').zip(_.Some('bar'))
   *
   *   // Returns None because `that` option is empty.
   *   _.Some('foo').zip(_.None())
   *
   *   // Returns None because `this` option is empty.
   *   _.None.zip(_.Some('bar'))
   *
   * @param that - The Options which is going to be zipped
   */
  zip<A, B>(
    this: Option<A>,
    that: Option<B>
  ): Option<readonly [_this: A, _that: B]> {
    return this.flatMap((a: A) => that.map((b: B) => F.tuple(a, b)))
  }
}

/**
 * This Case Class represents non-existent values.
 *
 * @internal
 */
class None extends AbstractOption implements T.None {
  // eslint-disable-next-line functional/prefer-readonly-type
  static #instance: None
  readonly _tag = 'None' as const

  get isDefined(): boolean {
    return false
  }

  get knownSize(): 0 | 1 {
    return 0
  }

  override get [Symbol.toStringTag]() {
    return this._tag
  }

  private constructor() {
    super()
    Object.freeze(this)
  }

  public static getInstance(): None {
    if (!None.#instance) {
      // eslint-disable-next-line functional/immutable-data
      None.#instance = new None()
    }
    return None.#instance
  }
}

/**
 * This is the Case Class Some<A> represents existing values of type A.
 *
 * @internal
 */
class Some<A> extends AbstractOption<A> implements T.Some<A> {
  readonly _tag = 'Some' as const

  get isDefined(): boolean {
    return true
  }

  get knownSize(): 0 | 1 {
    return 1
  }

  override get [Symbol.toStringTag]() {
    return this._tag
  }

  constructor(readonly value: A) {
    super()
    Object.freeze(this)
  }
}

export type Option<A> = None | Some<A>
