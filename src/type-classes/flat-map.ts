import type { HKT, Kind, TypeClass } from 'src/hkt'

import type { Functor } from './functor'

/** This TypeClass defines the ability to map something across containers */
export interface FlatMap<F extends HKT> extends Functor<F>, TypeClass<F> {
  readonly flatMap: <A, B>(
    fa: Kind<F, A>
  ) => (f: (a: A) => Kind<F, B>) => Kind<F, B>
}
