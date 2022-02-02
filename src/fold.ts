export function foldLeft<Acc>(acc: Acc) {
  return function reducer<Elm>(op: (acc: Acc, elm: Elm) => Acc) {
    return function apply(iterable: Iterable<Elm>): Acc {
      for (const el of iterable) acc = op(acc, el)
      return acc
    }
  }
}
