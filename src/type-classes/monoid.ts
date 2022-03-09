import type { Semigroup } from 'src/type-classes/semigroup'

/** Monoid extends the power of {@link Semigroup} by providing an additional empty value. */
export interface Monoid<A> extends Semigroup<A> {
  /**
   * This empty value should be an identity for the {@link Semigroup.concat}
   * operation, which means the following equalities hold for any choice of x.
   *
   *     concat(x, empty) = concat(empty, x) = x
   */
  readonly empty: A
}
