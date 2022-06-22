# Type classes

Type classes are a powerful tool used in functional programming to enable ad-hoc polymorphism, more commonly known as
overloading. Where many object-oriented languages leverage subtyping for polymorphic code, functional programming tends
towards a combination of parametric polymorphism (think type parameters, like Java generics) and ad-hoc polymorphism.

## Laws

Conceptually, all type classes come with laws. These laws constrain implementations for a given type and can be
exploited and used to reason about generic code.

For instance, the `Monoid` type class requires that `combine`/`concat` be associative and `empty` be an `identity`
element for combine.
That means the following equalities should hold for any choice of x, y, and z.

```
combine(x, combine(y, z)) === combine(combine(x, y), z)
combine(x, id) === combine(id, x) === x
```

With these laws in place, functions parametrized over a `Monoid` can leverage them for say, performance reasons. A
function that collapses a `Array<A>` into a single `A` can do so with `foldLeft` or `foldRight` since combine is assumed to be
**associative**, or it can break apart the list into smaller lists and collapse in parallel.

