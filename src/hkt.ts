/* eslint-disable functional/no-return-void,eslint-comments/disable-enable-pair */
declare const URI: unique symbol

export interface TypeClass<F extends HKT> {
  readonly [URI]?: F
}

export interface HKT {
  /** A = Output (Covariant) */
  readonly A?: unknown

  /** Will represent the computed type */
  readonly type?: unknown
}

export type Kind<F extends HKT, A> = F extends { readonly type: unknown }
  ? (F /** F has a type specified, it is concrete (like F = ArrayHKT) */ & {
      readonly A: A
    })['type']
  : {
      /**
       * F is generic, we need to mention all ot the types parameters to
       * guarantee that tye are never excluded from the type checking
       */
      readonly _F: F
      readonly _A: () => A
    }

export interface HKT3 {
  /** A = Output (Covariant) */
  readonly A?: unknown
  /** E = Error (Covariant) */
  readonly E?: unknown
  /** R = Requirements (Contravariant) */
  readonly R?: unknown

  /** TODO: still to implement S = State (Invariant) I = Category Input (Contravariant) */
  /** Will represent the computed type */
  readonly type?: unknown
}

export type Kind3<F extends HKT3, R, E, A> = F extends {
  readonly type: unknown
}
  ? (F /** F has a type specified, it is concrete (like F = ArrayHKT) */ & {
      readonly R: R
      readonly E: E
      readonly A: A
    })['type']
  : {
      /**
       * F is generic, we need to mention all ot the types parameters to
       * guarantee that tye are never excluded from the type checking
       */
      readonly _F: F
      readonly _R: (_: R) => void
      readonly _E: () => E
      readonly _A: () => A
    }
