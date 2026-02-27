import XCTest
import SwiftTreeSitter
import TreeSitterEl2

final class TreeSitterEl2Tests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_el2())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading el2 grammar")
    }
}
