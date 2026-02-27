package tree_sitter_el2_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_el2 "evan-a-w/tree-sitter-el2/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_el2.Language())
	if language == nil {
		t.Errorf("Error loading el2 grammar")
	}
}
