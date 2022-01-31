export abstract class Option<A> {
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
      : new None<T>()
  }

  /**
   * An Option factory which returns None in a manner consistent with the
   * collections hierarchy.
   */
  static empty<T>(): Option<T> {
    return new None<T>()
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

  /** Returns true if the option is INone, false otherwise. */
  abstract isEmpty(): boolean

  /** Returns true if the option is an instance of Some, false otherwise. */
  abstract isDefined(): boolean

  abstract knownSize(): 0 | 1

  /** Returns the option's value throw an exception if the option is empty */
  abstract get(): A

  /**
   * Returns the option's value if the option is nonempty, otherwise return the
   * result of evaluating default.
   */
  abstract getOrElse<B>(defaultValue: () => B): A | B

  /**
   * Returns the option's value if it is nonempty, or null if it is empty.
   * Although the use of null is discouraged, code written to use Option must
   * often interface with code that expects and returns nulls.
   */
  abstract orNull(): A | null

  /**
   * Returns a Some containing the result of applying f to this Option's value
   * if this Option is nonempty. Otherwise, return INone.
   *
   * @param f - The function to apply
   * @note This is similar to flatMap except here, f does not need to wrap its result in an Option.
   * @see also: flatMap
   * @see also: forEach
   */
  abstract map<B>(f: (a: A) => B): Option<B>

  /**
   * Returns the result of applying f to this Option's value if the Option is
   * nonempty. Otherwise, evaluates expression ifEmpty.
   *
   * @param ifEmpty – the expression to evaluate if empty.
   * @param f – the function to apply if nonempty.
   */
  abstract fold<B>(ifEmpty: () => B): (f: (a: A) => B) => B

  /**
   * Returns the result of applying f to this Option's value if this Option is
   * nonempty. Returns INone if this Option is empty. Slightly different from
   * map in that f is expected to return an Option (which could be INone)
   *
   * @param f - The function to apply
   * @see also: map
   * @see also: forEach
   */
  abstract flatMap<B>(f: (a: A) => Option<B>): Option<B>

  /**
   * Returns the nested Option value if it is nonempty. Otherwise, return INone.
   *
   * @example
   *   ;```ts
   *   Some(Some("something")).flatten // INone | "something"
   *   ```
   *
   * @see also: flatMap
   */
  abstract flatten<B>(): Option<B>

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns true. Otherwise, return INone.
   *
   * @param p – the predicate used for testing.
   */
  abstract filter(p: (a: A) => boolean): Option<A>

  /**
   * Returns this Option if it is nonempty and applying the predicate p to this
   * Option's value returns false. Otherwise, return INone.
   *
   * @param p – the predicate used for testing.
   */
  abstract filterNot(p: (a: A) => boolean): Option<A>

  /** Returns false if the option is INone, true otherwise. */
  abstract nonEmpty(): boolean

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
  abstract contains<A1 extends A>(elem: A1): boolean

  /**
   * Returns true if this option is nonempty and the predicate p returns true
   * when applied to this Option's value. Otherwise, returns false.
   *
   * @param p The predicate to test
   */
  abstract exists(p: (a: A) => boolean): boolean

  /**
   * Returns true if this option is empty or the predicate p returns true when
   * applied to this Option's value.
   *
   * @param p – the predicate to test
   */
  abstract forall(p: (a: A) => boolean): boolean

  /**
   * Apply the given procedure f to the option's value, if it is nonempty.
   * Otherwise, do nothing.
   *
   * @param f The procedure to apply.
   * @see also: map
   * @see also: flatMap
   */
  abstract foreach<U>(f: (a: A) => U): void

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
   * Returns this Option if it is nonempty, otherwise return the result of
   * evaluating alternative.
   *
   * @param alternative – the alternative expression.
   */
  abstract orElse<B extends A>(alternative: () => Option<B>): Option<B>

  /**
   * Returns a Some formed from this option and another option by combining the
   * corresponding elements in a pair. If either of the two options is empty,
   * INone is returned.
   *
   * @example
   *   // Returns Some(("foo", "bar")) because both options are nonempty.
   *   Some("foo") zip Some("bar")
   *
   *   // Returns INone because `that` option is empty.
   *   Some("foo") zip INone
   *
   *   // Returns INone because `this` option is empty.
   *   INone zip Some("bar")
   *
   * @param that The options which is going to be zipped
   */
  abstract zip<A1 extends A, B>(that: Option<B>): Option<[_this: A1, _that: B]>

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
  abstract unzip<A1, A2>(asPair: (a: A) => [A1, A2]): [Option<A1>, Option<A2>]

  /**
   * Returns a singleton iterator returning the Option's value if it is
   * nonempty, or an empty iterator if the option is empty.
   */
  abstract iterator: Iterator<A>

  /**
   * Returns a singleton list containing the Option's value if it is nonempty,
   * or the empty list if the Option is empty.
   */
  abstract toList(): Array<A>

  /**
   * Returns a scala.util.Left containing the given argument left if this Option
   * is empty, or a scala.util.Right containing this Option's value if this is
   * nonempty. This is equivalent to: option match { case Some(x) => Right(x)
   * case INone => Left(left) }
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
export interface ISome<A> extends Option<A> {
  new (value: A): Option<A> // TODO: check if Option<A> is the correct type

  get(): A
}

/** This case object represents non-existent values. */
interface INone<A = never> extends Option<A> {
  new (): Option<A>

  get(): never // TODO: check if never is the correct type
}

/** This case object represents non-existent values. */
export class None<A> extends Option<A> implements INone<A> {
  constructor() {
    super()
  }
}

/** Class Some<A> represents existing values of type A. */
export class Some<A> extends Option<A> implements ISome<A> {
  readonly value: A

  constructor(value: A) {
    super()
    this.value = value
  }

  get(): A {
    return this.value
  }
}
