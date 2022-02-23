#! /bin/bash

pnpm exec tsc \
  --noEmit \
  --noErrorTruncation true \
  --pretty true \
  --diagnostics \
  $1
