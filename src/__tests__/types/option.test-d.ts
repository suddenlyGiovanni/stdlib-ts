import { expectAssignable, expectType } from 'tsd'

import * as F from '../../option/fluent'
import * as P from '../../option/pipable'

import type * as T from '../../option/model'

expectAssignable<T.None>(F.default.none)

expectType<boolean>(P.isNone(F.default.none))

expectType<boolean>(P.exists(() => true)(F.default.some(1)))

expectType<boolean>(P.exists(() => true)(F.default.none))
