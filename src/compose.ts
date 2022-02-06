import type { F } from 'ts-toolbelt'

// TODO check https://gist.github.com/joshcox/d59bf241458cf456b49f3c5b098af9fa
// TODO reimplement with support from variadic tuple types!

export const compose: F.Compose =
  <Fns extends F.Function<[any], any>[]>(...fns: [...Fns]) =>
  <P>(param: P) =>
    fns.reduceRight((x, f) => f(x), param)
