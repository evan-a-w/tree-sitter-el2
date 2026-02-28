# tree-sitter-el2

Tree-sitter grammar for the el2 language (low-level ML+C blend).

Status: draft but covers core syntax per docs/spec.txt.

What’s covered
- Modules/signatures/functors: `module`, `module type`, `struct/sig` bodies.
- Declarations: `let`, `var`, `type`, `extern` with ABI string, `open`, functors.
- Types: pointers `*T`, function types `fn(...) -> T`, tuples, arrays `[T; N]`, records, variants, type application `Foo[bar]`.
- Expressions: blocks `{ ... }`, `if ... then ... else ...`, `match ... with`, `loop { ... }`, `break(value)`, `continue`, `return expr;`, `unsafe { ... }`.
- Calls with explicit generics: `f[T1, T2](args...)`.
- Record/variant construction and patterns.
- Operators: boolean `&&`, `||`, `!` and common symbolic operators with OCaml-like precedence subsets.

Notable choices/limits
- Infix operators: prioritized sets for `||`, `&&`, `|`, `^`, `&`, `== !=`, `< <= > >=`, `+ -`, `* / %`.
  Other symbolic operators will need parentheses or wrapper functions for now.
- `:=` is a statement (assignment), not an expression.
- Braced blocks vs record literals: record literals parse as `{ x = e; ... }` with only field inits; any `let/var/:=/control` yields a block.

File mapping
- Implementation: `*.el2` (each file defines an implicit toplevel module named after the file).
- Interface: `*.eli` (controls visibility; all items are otherwise public).

Using
- Install the Tree-sitter CLI, then from this directory run:
  - `tree-sitter generate --abi 14`
  - `tree-sitter test` (runs files in `corpus/`)
     - $ XDG_CACHE_HOME=/tmp tree-sitter generate --abi 14 && XDG_CACHE_HOME=/tmp tree-sitter test && XDG_CACHE_HOME=/tmp ./test/error-corpus/verify-errors.sh
  - `tree-sitter parse path/to/file.el2`

License: MIT
# tree-sitter-el2
