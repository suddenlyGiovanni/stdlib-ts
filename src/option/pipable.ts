import * as F from '../fuction'
import _, { Option } from './fluent'

import type * as T from './fluent'

/**
 * Returns `true` if the option is an instance of `Some`, `false` otherwise.
 *
 * @remarks
 *   This function is a port of `fp-ts`'s Option interface.
 * @example
 *   assert.strictEqual(isSome(some(1)), true)
 *   assert.strictEqual(isSome(none), false)
 */
export const isSome = <A>(fa: T.Option<A>): fa is T.Some<A> =>
  fa._tag === 'Some'

/**
 * Returns `true` if the option is `None`, `false` otherwise.
 *
 * @remarks
 *   This function is a port of `fp-ts`'s Option interface.
 * @example
 *   assert.strictEqual(isNone(some(1)), false)
 *   assert.strictEqual(isNone(none), true)
 */
export const isNone = (fa: T.Option<unknown>): fa is T.None =>
  fa._tag === 'None'

/**
 * Returns `true` if the predicate is satisfied by the wrapped value
 *
 * @remarks
 *   This function is a port of `fp-ts`'s Option interface.
 * @example
 *   assert.strictEqual(
 *     pipe(
 *       some(1),
 *       exists((n) => n > 0)
 *     ),
 *     true
 *   )
 *   assert.strictEqual(
 *     pipe(
 *       some(1),
 *       exists((n) => n > 1)
 *     ),
 *     false
 *   )
 *   assert.strictEqual(
 *     pipe(
 *       none,
 *       exists((n) => n > 0)
 *     ),
 *     false
 *   )
 */
export const exists =
  <A>(predicate: F.Predicate<A>) =>
  (ma: T.Option<A>): boolean =>
    isNone(ma) ? false : predicate(ma.value)

export const filter: {
  <A, B extends A>(refinement: F.Refinement<A, B>): (
    fa: T.Option<A>
  ) => T.Option<B>
  <A>(predicate: F.Predicate<A>): <B extends A>(fb: T.Option<B>) => T.Option<B>
  <A>(predicate: F.Predicate<A>): (fa: T.Option<A>) => T.Option<A>
} =
  <A>(predicate: F.Predicate<A>) =>
  (fa: T.Option<A>) =>
    isNone(fa) ? _.none : predicate(fa.value) ? fa : _.none

/**
 * Returns this Option if it is nonempty and applying the predicate p to this
 * Option's value returns false. Otherwise, return None
 *
 * @remarks
 *   This method is a port of Scala's Option interface.
 */
export const filterNot =
  <A>(predicate: F.Predicate<A>) =>
  (fa: T.Option<A>): T.Option<A> => {
    return isSome(fa) && !predicate(fa.value) ? fa : _.none
  }

/**
 * Composes computations in sequence, using the return value of one computation
 * to determine the next computation.
 *
 * @remarks
 *   Returns the result of applying f to this Option's value if this Option is
 *   nonempty. Returns None if this Option is empty. Slightly different from map
 *   in that f is expected to return an Option (which could be None)
 */
export const flatMap: <A, B>(
  f: (a: A) => T.Option<B>
) => (ma: T.Option<A>) => T.Option<B> = (f) => (ma) =>
  isNone(ma) ? _.none : f(ma.value)

export const compact: <A>(fa: T.Option<T.Option<A>>) => T.Option<A> = flatMap(
  F.identity
)
/**
 * Returns the nested Option value if it is nonempty. Otherwise, return None.
 * Derivable from `Chain` / 'flatMap'.
 */
export const flatten: <A>(mma: T.Option<T.Option<A>>) => T.Option<A> = compact

/** Less strict version of {@link fold} */
export const foldW =
  <A, B, C>(onNone: F.Lazy<B>, onSome: (a: A) => C) =>
  (ma: T.Option<A>): B | C =>
    isNone(ma) ? onNone() : onSome(ma.value)

/**
 * Takes a (lazy) default value, a function, and an `Option` value, if the
 * `Option` value is `None` the default value is returned, otherwise the
 * function is applied to the value inside the `Some` and the result is returned.
 */
export const fold: <A, B>(
  onNone: F.Lazy<B>,
  onSome: (a: A) => B
) => (ma: T.Option<A>) => B = foldW

/**
 * Returns true if this option is empty or the predicate p returns true when
 * applied to this Option's value.
 */
export const forall =
  <A>(predicate: F.Predicate<A>) =>
  (ma: Option<A>): boolean => {
    return isNone(ma) || predicate(ma.value)
  }

/* eslint-disable functional/no-conditional-statement, functional/no-expression-statement, functional/no-return-void */
/**
 * Apply the given procedure `f` to the Option's value, if it is nonempty.
 * Otherwise, do nothing.
 */
export const forEach =
  <A, U>(f: (a: A) => U) =>
  (fa: Option<A>): void => {
    if (!isNone(fa)) {
      f(fa.value)
    }
  }
/* eslint-enable functional/no-conditional-statement, functional/no-expression-statement, functional/no-return-void */

/** Less strict version of {@link getOrElse} */
export const getOrElseW =
  <B>(onNone: F.Lazy<B>) =>
  <A>(ma: T.Option<A>): A | B =>
    isNone(ma) ? onNone() : ma.value

/**
 * Extracts the value out of the structure, if it exists. Otherwise returns the
 * given default value
 */
export const getOrElse: <A>(onNone: F.Lazy<A>) => (ma: T.Option<A>) => A =
  getOrElseW
