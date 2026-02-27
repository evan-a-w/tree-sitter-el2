;; Scopes
(source_file) @scope
(block) @scope
(module_expr) @scope
(match_expression) @scope

;; Definitions
(let_decl name: (identifier) @local.definition)
(var_decl name: (identifier) @local.definition)
(type_decl name: (identifier) @local.definition)
(module_decl name: (uidentifier) @local.definition)
(module_type_decl name: (uidentifier) @local.definition)
(functor_decl name: (uidentifier) @local.definition)
(param (identifier) @local.definition.parameter)

;; Pattern bindings (variables)
(pattern (identifier) @local.definition)
(pat_field (identifier) @local.definition)

;; References
(identifier) @local.reference
(module_value_path (identifier) @local.reference)
