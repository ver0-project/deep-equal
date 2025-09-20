# AI Context: @ver0/deep-equal

This document provides comprehensive context for AI assistants working on the @ver0/deep-equal project. It consolidates
all project-specific guidelines, coding principles, and tool configurations into a single universal reference.

## Project Overview

### Purpose and Scope

- **Project**: @ver0/deep-equal - A JavaScript/TypeScript library for deep equality comparison
- **Description**: High-performance implementation focusing on correctness and edge case handling
- **Key Features**:
  - Supports various JavaScript data types (objects, arrays, Maps, Sets, RegExp, Date, etc.)
  - Handles circular references and specialized object types
  - Designed for use in testing frameworks and general JavaScript applications
  - TypeScript support with proper typing

### Repository Information

- **Repository**: https://github.com/ver0-project/deep-equal
- **Author**: Anton Zinovyev <xog3@yandex.ru>
- **License**: MIT
- **Package Name**: @ver0/deep-equal
- **Node.js Support**: ≥18
- **Module System**: ES Modules (type: "module")

## Project Structure

```text
src/
├── is-equal.ts          # Core implementation of deep equality function
├── fixtures/            # Test fixtures and benchmark data
├── *.test.ts           # Test suites
└── *.benchmark.ts      # Performance benchmarking
```

### Key Components

- `isEqual`: Main function that performs deep equality comparison
- Extensive test suite with comprehensive test cases for different data types
- Benchmarks comparing performance against other deep-equal implementations

### Usage Example

```typescript
import {isEqual} from '@ver0/deep-equal';

// Compare any two values for deep equality
const result = isEqual(objectA, objectB);
```

## Technical Stack

### Core Technologies

- **Language**: TypeScript with modern ES modules
- **Build System**: TypeScript compiler (tsc) with custom build configuration
- **Package Management**: Yarn Berry (v4.6.0)
- **Module System**: ES Modules

### Testing and Quality Assurance

- **Testing Framework**: Vitest
- **Code Coverage**: Vitest with V8 coverage
- **Linting**: ESLint with @ver0/eslint-config
- **Code Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit hooks
- **Staged Files**: lint-staged for pre-commit linting
- **Commit Validation**: commitlint for commit message validation

### CI/CD and Release

- **Continuous Integration**: GitHub Actions
- **Release Management**: semantic-release for automated versioning
- **Coverage Reporting**: Codecov integration

### Dependencies and Benchmarking

- **Benchmark Competitors**:
  - deep-equal
  - dequal
  - fast-deep-equal
  - react-fast-compare
