import type { HKT, Kind, TypeClass } from 'src/hkt'

import type { Functor } from './functor'

/** The capability to “lift” a plain value into a monadic type, an operation known as pure */
export interface Applicative<F extends HKT> extends Functor<F>, TypeClass<F> {
  readonly pure: <A>(f: A) => Kind<F, A>
}
