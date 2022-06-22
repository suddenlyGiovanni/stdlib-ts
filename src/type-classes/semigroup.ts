/**
 * If a type `A` can form a Semigroup it has an associative binary operation.
 *
 *     interface Semigroup<A> {
 *       readonly concat: (x: A, y: A) => A
 *     }
 *
 * ## Associativity
 *
 * Means the following equality must hold for any choice of x, y, and z.
 * `concat(x, concat(y, z)) === concat(concat(x, y), z)`
 *
 * A common example of a semigroup is the type string with the operation +.
 *
 * @example
 *   const semigroupString: Semigroup<string> = { concat: (x, y) => x + y }
 *
 *   const x = 'x' const y = 'y' const z = 'z'
 *
 *   semigroupString.concat(x, y) // 'xy'
 *
 *   semigroupString.concat(x, semigroupString.concat(y, z)) // 'xyz'
 *
 *   semigroupString.concat(semigroupString.concat(x, y), z) // 'xyz'
 *
 * @see Adapted from {@link https://typelevel.org/cats}
 */
export interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A
}
