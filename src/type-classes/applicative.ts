import type * as HKT from 'src/hkt'
import type { Functor } from 'src/type-classes/functor'

/** The capability to “lift” a plain value into a monadic type, an operation known as pure */
export interface Applicative<F extends HKT.HKT>
  extends Functor<F>,
    HKT.Typeclass<F> {
  readonly pure: <A>(f: A) => HKT.Kind<F, A>
}
