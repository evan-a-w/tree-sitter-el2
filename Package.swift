// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterEl2",
    products: [
        .library(name: "TreeSitterEl2", targets: ["TreeSitterEl2"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterEl2",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterEl2Tests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterEl2",
            ],
            path: "bindings/swift/TreeSitterEl2Tests"
        )
    ],
    cLanguageStandard: .c11
)
