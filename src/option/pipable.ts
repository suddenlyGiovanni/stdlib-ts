import _ from './fluent'

import type * as F from '../fuction'
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

/**
 * @since 2.0.0
 * @category Instance operations
 */
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
