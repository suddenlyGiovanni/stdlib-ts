import { expectAssignable } from 'tsd'

import * as F from '../../option/fluent'
import * as T from '../../option/model'

expectAssignable<T.None>(F.default.none)
