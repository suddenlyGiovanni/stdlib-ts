import type { Semigroup } from "src/semigroup";

export interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}
