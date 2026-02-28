// Tree-sitter grammar for el2 (draft)

module.exports = grammar({
  name: 'el2',

  extras: $ => [
    /[\s\u00A0\f\r\t\n]/,
    $.comment,
    $.block_comment,
  ],

  supertypes: $ => [
    $.declaration,
    $.expression,
    $.type,
    $.pattern,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.record_literal, $.block],
    [$.record_type, $.block],
    [$.call_expression, $.field_expression],
    [$.constructor_expression, $.call_expression],
    [$.constructor_expression, $.field_expression],
    [$.type_application, $.array_type],
    [$.module_path, $.type_path],
    [$.module_path, $.module_value_path],
    [$.constructor_expression, $.module_value_path],
    [$.if_expression, $.binary_expression],
    [$.match_expression, $.binary_expression],
  ],

  // Precedence levels (low to high)
  precedences: $ => [
    [
      'seq', // statement sequencing via ';' (handled structurally in block)
    ],
    [
      'assign', // not an expression; ':=' is a statement
    ],
    [
      'or',
      'and',
      'bitor',
      'bitxor',
      'bitand',
      'compare',
      'rel',
      'add',
      'mul',
      'unary',
      'call',
      'member'
    ],
  ],

  rules: {
    source_file: $ => repeat(choice(seq($.declaration, optional(';')), ';')),

    // Identifiers
    identifier: _ => /[a-z_][a-zA-Z0-9_]*/,
    // Uppercase identifiers for constructors and module names
    uidentifier: _ => /[A-Z][a-zA-Z0-9_]*/,
    // Operator identifiers and names (for definitions and qualified use)
    operator_identifier: _ => token(/[$&*+\-./:<=>?@^|~!%]+/),
    operator_name: $ => seq('(', $.operator_identifier, ')'),

    // Comments
    comment: _ => token(seq('//', /.*/)),
    block_comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    // Literals
    integer: _ => token(choice(
      /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/,
      /0[oO][0-7](_?[0-7])*/,
      /0[bB][01](_?[01])*/,
      /[0-9](_?[0-9])*/
    )),

    float: _ => token(choice(
      /[0-9](_?[0-9])*\.[0-9](_?[0-9])*(?:[eE][+-]?[0-9](_?[0-9])*)?/,
      /[0-9](_?[0-9])*(?:\.[0-9](_?[0-9])*)?[eE][+-]?[0-9](_?[0-9])*/
    )),

    char: _ => token(seq("'", /(?:[^'\\]|\\.)/, "'")),
    string: _ => token(seq('"', repeat(choice(/[^"\\\n]/, /\\./)), '"')),

    true: _ => 'true',
    false: _ => 'false',
    null: _ => 'null',

    // Declarations
    declaration: $ => choice(
      $.open_decl,
      $.let_open_decl,
      $.let_decl,
      $.var_decl,
      $.type_decl,
      $.module_decl,
      $.module_type_decl,
      $.functor_decl,
      $.extern_decl,
    ),

    open_decl: $ => seq('open', $.module_path),
    let_open_decl: $ => seq('let', 'open', $.module_path),

    let_decl: $ => seq(
      'let',
      field('name', choice($.identifier, $.operator_name)),
      optional($.type_params),
      optional(field('parameters', $.parameters)),
      ':', field('type', $.type),
      '=', field('value', $.expression)
    ),

    var_decl: $ => seq(
      'var',
      field('name', $.identifier),
      ':', field('type', $.type),
      '=', field('value', $.expression)
    ),

    type_decl: $ => prec(1, seq(
      'type',
      field('name', $.identifier),
      optional($.type_params),
      '=', field('body', choice($.record_type, $.variant_type, $.type))
    )),

    module_decl: $ => seq(
      'module',
      field('name', $.uidentifier),
      optional(seq(':', field('sig', $.modtype))),
      '=', field('modexpr', $.module_expr)
    ),

    module_expr: $ => choice(
      seq('struct', repeat(seq($.declaration, optional(';'))), 'end'),
      $.module_path,
      $.module_application
    ),

    module_application: $ => seq(field('functor', $.module_path), '(', field('arg', $.module_path), ')'),

    module_type_decl: $ => seq(
      'module', 'type', field('name', $.uidentifier), '=',
      'sig', repeat(seq($.sig_item, optional(';'))), 'end'
    ),

    functor_decl: $ => seq(
      'module', field('name', $.uidentifier),
      '(', field('arg_name', $.uidentifier), ':', field('arg_sig', $.modtype), ')',
      optional(seq(':', field('result_sig', $.modtype))),
      '=', 'struct', repeat(seq($.declaration, optional(';'))), 'end'
    ),

    extern_decl: $ => seq(
      'extern', field('abi', $.string),
      'let', field('name', $.identifier),
      field('parameters', $.parameters),
      ':', field('type', $.type)
    ),

    // Signature items (interface specs)
    sig_item: $ => choice(
      $.type_sig,
      $.let_sig,
      $.module_sig,
      $.module_type_sig,
    ),

    type_sig: $ => prec(1, seq('type', $.identifier, optional($.type_params), optional(seq('=', choice($.record_type, $.variant_type, $.type))))),
    let_sig: $ => seq('let', choice($.identifier, $.operator_name), $.parameters, ':', $.type),
    module_sig: $ => seq('module', $.uidentifier, ':', $.modtype),
    module_type_sig: $ => seq('module', 'type', $.uidentifier, '=', $.modtype),

    modtype: $ => choice(
      $.module_path,
      seq('sig', repeat(seq($.sig_item, optional(';'))), 'end')
    ),

    // Parameters and type params
    parameters: $ => seq('(', optional(seq($.param, repeat(seq(',', $.param)))), ')'),
    param: $ => seq($.identifier, ':', $.type),

    type_params: $ => seq('[', $.identifier, repeat(seq(',', $.identifier)), ']'),
    type_arguments: $ => seq('[', $.type, repeat(seq(',', $.type)), ']'),

    // Types
    type: $ => choice(
      $.type_path,
      $.pointer_type,
      $.function_type,
      $.tuple_type,
      $.array_type,
      $.record_type
    ),

    type_path: $ => choice(
      $.identifier,
      seq($.uidentifier, '.', $.identifier),
      seq($.uidentifier, repeat1(seq('.', $.uidentifier)), '.', $.identifier),
      $.type_application
    ),

    type_application: $ => seq(field('head', choice(
      $.identifier,
      seq($.uidentifier, '.', $.identifier),
      seq($.uidentifier, repeat1(seq('.', $.uidentifier)), '.', $.identifier)
    )), field('targs', $.type_arguments)),

    pointer_type: $ => prec.right('unary', seq('*', field('type', $.type))),

    function_type: $ => seq(
      'fn', '(', optional(seq($.type, repeat(seq(',', $.type)))), ')', '->', $.type
    ),

    tuple_type: $ => seq('(', $.type, ',', $.type, repeat(seq(',', $.type)), ')'),

    array_type: $ => seq('[', $.type, ';', $.integer, ']'),

    record_type: $ => seq('{', optional(seq($.field_type, repeat(seq(';', $.field_type)), optional(';'))), '}'),
    field_type: $ => seq($.identifier, ':', $.type),

    // Variant and record declarations (type bodies)
    variant_type: $ => seq($.ctor_decl, repeat(seq('|', $.ctor_decl))),
    ctor_decl: $ => seq($.uidentifier, optional(choice(
      seq('(', $.type, repeat(seq(',', $.type)), ')'),
      $.record_type
    ))),

    // Statements inside blocks
    statement: $ => choice(
      seq($.open_decl, ';'),
      seq($.let_open_decl, ';'),
      seq('let', $.identifier, optional($.type_params), optional($.parameters), ':', $.type, '=', $.expression, ';'),
      seq('var', $.identifier, ':', $.type, '=', $.expression, ';'),
      $.assign_stmt,
      $.break_stmt,
      $.continue_stmt,
      $.return_stmt,
      seq($.expression, ';')
    ),

    assign_stmt: $ => seq($.lvalue, ':=', $.expression, ';'),
    lvalue: $ => choice($.identifier, seq('*', $.expression), $.field_expression),

    break_stmt: $ => seq('break', '(', $.expression, ')', ';'),
    continue_stmt: $ => seq('continue', ';'),
    return_stmt: $ => seq('return', $.expression, ';'),

    // Expressions
    expression: $ => choice(
      $.block,
      $.if_expression,
      $.match_expression,
      $.loop_expression,
      $.unsafe_block,
      $.scoped_open_expression,
      $.call_expression,
      $.tuple_expression,
      $.field_expression,
      $.constructor_expression,
      $.record_literal,
      $.unary_expression,
      $.binary_expression,
      $.literal,
      $.identifier,
      $.operator_name,
      alias($.module_value_path, $.qualified_value),
      $.parenthesized_expression,
    ),

    block: $ => seq('{', repeat($.statement), optional($.expression), '}'),
    unsafe_block: $ => seq('unsafe', $.block),

    if_expression: $ => prec.right('or', seq('if', $.expression, 'then', $.expression, 'else', $.expression)),

    match_expression: $ => prec.right('or', seq(
      'match', field('scrutinee', $.expression), 'with',
      repeat1(seq('|', field('pattern', $.pattern), '->', field('body', $.expression)))
    )),

    loop_expression: $ => seq('loop', $.block),

    scoped_open_expression: $ => seq($.module_path, '.(', choice($.expression, $.operator_identifier), ')'),

    qualified_uidentifier: $ => seq($.uidentifier, repeat(seq('.', $.uidentifier)), '.', $.uidentifier),
    constructor_expression: $ => seq(choice($.uidentifier, $.qualified_uidentifier), optional(choice(
      seq('(', $.expression, repeat(seq(',', $.expression)), ')'),
      $.record_literal
    ))),

    record_literal: $ => seq('{', optional(seq($.field_init, repeat(seq(';', $.field_init)), optional(';'))), '}'),
    field_init: $ => seq($.identifier, '=', $.expression),

    parenthesized_expression: $ => seq('(', $.expression, ')'),
    tuple_expression: $ => seq('(', $.expression, ',', $.expression, repeat(seq(',', $.expression)), ')'),

    call_expression: $ => prec('call', seq(
      field('function', choice($.identifier, $.operator_name, $.module_value_path, $.field_expression, $.parenthesized_expression, $.scoped_open_expression)),
      optional($.type_arguments),
      '(', optional(seq($.expression, repeat(seq(',', $.expression)))), ')'
    )),

    field_expression: $ => prec('member', seq(field('object', choice($.identifier, $.module_value_path, $.parenthesized_expression, $.call_expression)), '.', field('field', $.identifier))),

    unary_expression: $ => prec.right('unary', choice(
      seq('!', $.expression),
      seq('-', $.expression),
      seq('*', $.expression), // deref
      seq('&', $.expression)  // address-of
    )),

    // Binary expressions with OCaml-like precedence subsets
    binary_expression: $ => choice(
      prec.left('or', seq($.expression, '||', $.expression)),
      prec.left('and', seq($.expression, '&&', $.expression)),
      prec.left('bitor', seq($.expression, '|', $.expression)),
      prec.left('bitxor', seq($.expression, '^', $.expression)),
      prec.left('bitand', seq($.expression, '&', $.expression)),
      prec.left('compare', seq($.expression, choice('==', '!='), $.expression)),
      prec.left('rel', seq($.expression, choice('<', '<=', '>', '>='), $.expression)),
      prec.left('add', seq($.expression, choice('+', '-'), $.expression)),
      prec.left('mul', seq($.expression, choice('*', '/', '%'), $.expression)),
    ),

    // Patterns
    pattern: $ => choice(
      '_',
      $.identifier,
      $.literal,
      $.tuple_pattern,
      $.constructor_pattern,
      $.record_pattern
    ),

    tuple_pattern: $ => seq('(', $.pattern, ',', $.pattern, repeat(seq(',', $.pattern)), ')'),
    constructor_pattern: $ => seq(choice($.uidentifier, $.qualified_uidentifier), optional(choice(
      seq('(', $.pattern, repeat(seq(',', $.pattern)), ')'),
      $.record_pattern
    ))),
    record_pattern: $ => seq('{', optional(seq($.pat_field, repeat(seq(';', $.pat_field)), optional(';'))), '}'),
    pat_field: $ => choice($.identifier, seq($.identifier, '=', $.pattern)),

    // Module paths
    module_path: $ => prec.right(seq($.uidentifier, repeat(seq('.', $.uidentifier)))),
    //module_value_path: $ => choice(
    // seq($.uidentifier, '.', $.identifier),
    //  seq($.uidentifier, repeat1(seq('.', $.uidentifier)), '.', $.identifier),
    //),
    // Parse qualified value refs without relying on module_path to avoid
    // the A.<id> ambiguity with module_path's own dotted repetition.
    module_value_path: $ => prec('member', seq($.uidentifier, repeat(seq('.', $.uidentifier)), '.', $.identifier)),

    // Literals wrapper
    literal: $ => choice($.float, $.integer, $.char, $.string, $.true, $.false, $.null),
  }
});
