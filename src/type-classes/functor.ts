import type { HKT, Kind, TypeClass } from 'src/hkt'

/**
 * Functor is a type class that abstracts over type constructors that can be
 * map‘ed over. Examples of such type constructors are Array, Option
 *
 * `map` can be used to turn functions `a -> b` into functions `f a -> f b`
 * whose argument and return types use the type constructor `f` to represent
 * some computational context.
 *
 * A Functor instance must obey two laws:
 *
 * 1. Identity: Mapping with the identity function is a no-op. `F.map(fa, a => a) <-> fa`
 * 2. Composition: `F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)`
 */
export interface Functor<F extends HKT> extends TypeClass<F> {
  readonly map: <A, B>(fa: Kind<F, A>) => (f: (a: A) => B) => Kind<F, B>
}
