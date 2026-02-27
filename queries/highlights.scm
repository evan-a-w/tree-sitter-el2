;; Comments
(comment) @comment
(block_comment) @comment

;; Literals
(string) @string
(char) @string.special
(integer) @number
(float) @number
(true) @boolean
(false) @boolean
(null) @constant.builtin

;; Declarations and definitions
(type_decl name: (identifier) @type.definition)
(type_sig (identifier) @type)
(record_type (field_type (identifier) @field) @type)
(variant_type (ctor_decl (uidentifier) @constructor))

(let_decl name: (identifier) @function)
(let_decl name: (operator_name (operator_identifier) @function))
(let_sig (identifier) @function)
(let_sig (operator_name (operator_identifier) @function))
(var_decl name: (identifier) @variable)

(module_decl name: (uidentifier) @module)
(module_type_decl name: (uidentifier) @type)
(module_sig (uidentifier) @module)
(module_expr (module_path) @module)
(module_application functor: (module_path) @module)

;; Calls and paths
(call_expression function: (identifier) @function.call)
(call_expression function: (module_value_path) @function.call)
(field_expression field: (identifier) @field)
(type_path (uidentifier) @module)
(type_path (identifier) @type)

;; Keywords (node-based approximation)
(if_expression) @keyword
(match_expression) @keyword
(loop_expression) @keyword
(break_stmt) @keyword
(continue_stmt) @keyword
(return_stmt) @keyword
(unsafe_block) @keyword
(open_decl) @keyword
(let_open_decl) @keyword
(extern_decl) @keyword
(module_decl) @keyword
(module_type_decl) @keyword
(functor_decl) @keyword
(type_decl) @keyword
(var_decl) @keyword
(let_decl) @keyword

;; Parameters
(param (identifier) @parameter)

;; Patterns
(constructor_pattern (uidentifier) @constructor)
(constructor_pattern (qualified_uidentifier) @constructor)
(pat_field (identifier) @field)
