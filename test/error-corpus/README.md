# Error Recovery Corpus

Files in this directory are intentionally malformed.

They are not consumed by `tree-sitter test` (which reads `test/corpus`).
Use the verifier script to ensure each case still produces recovery nodes:

```sh
XDG_CACHE_HOME=/tmp ./test/error-corpus/verify-errors.sh
```

A case passes when parse output contains at least one `ERROR` or `MISSING` node.
