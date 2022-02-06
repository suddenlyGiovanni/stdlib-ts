export function tap<A>(cb: (a: A) => unknown): (a: A) => A {
  return (a) => {
    cb(a)
    return a
  }
}
