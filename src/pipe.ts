import type { F } from 'ts-toolbelt'

export const pipe: F.Pipe =
  <Fns extends readonly F.Function<[any], any>[]>(...fns: [...Fns]) =>
  <A>(param: A) =>
    fns.reduce((acc, f) => f(acc), param)
