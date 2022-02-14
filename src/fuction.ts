/** Models a lazy operation `() => A` */
export interface Lazy<A> {
  (): A
}

/** Models a predicate function `(a: A) => boolean` */
export interface Predicate<A> {
  (a: A): boolean
}

/** Inverts a boolean predicate */
export function not<A>(predicate: Predicate<A>): Predicate<A> {
  return (a) => !predicate(a)
}

/** Models `(a: A) => a is B` */
export interface Refinement<A, B extends A> {
  (a: A): a is B
}

/**
 * Models (a: A) => A
 *
 * In mathematics, an endomorphism is a morphism from a mathematical object to itself
 *
 * E.g. the identity function
 */
export interface Endomorphism<A> {
  (a: A): A
}

/** Models (...args: A) => B */
export interface FunctionN<Args extends ReadonlyArray<unknown>, B> {
  (...args: readonly [...Args]): B
}

/** Will raise if called */
export function absurd<A = never>(_: never): A {
  throw new Error('Called `absurd` function which should be un-callable')
}

/** A constant function that always return A */
export function constant<A>(a: A): Lazy<A> {
  return () => a
}

/** Type Hole, to be used while implementing functions where you need a placeholder */
export function hole<T>(): T {
  throw new Error('Hole should never be called')
}

/** Identity function */
export function identity<A>(a: A): A {
  return a
}

/** Force a string to be literal */
export function literal<K extends string>(k: K): K {
  return k
}

/** Construct tuples */
export function tuple<T extends ReadonlyArray<unknown>>(...t: T): Readonly<T> {
  return t
}

/**
 * Creates a tupled version of this function: instead of `n` arguments, it
 * accepts a single tuple argument.
 *
 * @example
 *   const add = tupled((x: number, y: number): number => x + y)
 *
 *   assert.strictEqual(add([1, 2]), 3)
 */
export function tupled<A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B
): (a: Readonly<A>) => B {
  return (a) => f(...a)
}
