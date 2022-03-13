import type { HKT, TypeClass } from 'src/hkt'

import type { Applicative } from './applicative'
import type { FlatMap } from './flat-map'

export interface Monad<F extends HKT>
  extends Applicative<F>,
    FlatMap<F>,
    TypeClass<F> {}
