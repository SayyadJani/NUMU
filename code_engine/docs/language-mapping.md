# Language Mapping Specification

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target Engine:** Judge0 CE v1.13.1  
**Status:** IMPLEMENTATION-READY SPECIFICATION  

---

## 1. Overview & Security Requirement

To decouple the NUMU application from underlying execution engine quirks, NUMU maintains its own abstract, slug-based **Language Identifiers** (e.g. `"python"`, `"cpp"`, `"javascript"`). 

### Critical Security Rule: Server-Side Validation Whitelist
> [!IMPORTANT]
> The NUMU Next.js frontend must **never** supply a raw numerical `language_id` directly to Judge0. An attacker could otherwise submit arbitrary IDs to invoke unauthorized toolchains or trigger legacy compilers.
> 
> The NestJS backend must accept only approved NUMU language slugs, validate them against a strict server-side whitelist, and translate them to the corresponding Judge0 ID internally.

---

## 2. Verified Language Mapping Table (Judge0 CE v1.13.1)

The following mapping associates NUMU language identifiers with real, verified Judge0 CE v1.13.1 toolchain IDs:

| NUMU Language Slug | Display Name | Judge0 ID | Toolchain & Version | Status | Default Boilerplate Extension |
| :--- | :--- | :---: | :--- | :---: | :---: |
| `python` / `python3` | Python 3 | **71** | Python 3.8.1 | **Enabled** | `.py` |
| `python2` | Python 2 | **70** | Python 2.7.17 | Disabled (Deprecated) | `.py` |
| `cpp` / `cpp-gcc9` | C++ (GCC 9.2.0) | **54** | g++ (Ubuntu 9.2.0-1ubuntu1~19.10) 9.2.0 | **Enabled (Default C++)** | `.cpp` |
| `cpp-gcc8` | C++ (GCC 8.3.0) | **53** | g++ (Ubuntu 8.3.0-6ubuntu1~19.10) 8.3.0 | Enabled | `.cpp` |
| `cpp-gcc7` | C++ (GCC 7.4.0) | **52** | g++ (Ubuntu 7.4.0-1ubuntu1~19.10) 7.4.0 | Enabled (Phase 4C Baseline)| `.cpp` |
| `cpp-clang` | C++ (Clang 7.0.1) | **76** | clang 7.0.1-8 | Enabled | `.cpp` |
| `c` / `c-gcc9` | C (GCC 9.2.0) | **50** | gcc (Ubuntu 9.2.0-1ubuntu1~19.10) 9.2.0 | **Enabled** | `.c` |
| `java` | Java (OpenJDK 13) | **62** | OpenJDK 13.0.1 (build 13.0.1+9) | **Enabled** | `.java` |
| `javascript` / `node` | JavaScript (Node.js) | **63** | Node.js v12.14.0 | **Enabled** | `.js` |
| `typescript` | TypeScript | **74** | TypeScript 3.7.4 (Node.js 12.14.0) | **Enabled** | `.ts` |
| `go` | Go | **60** | go version go1.13.5 linux/amd64 | **Enabled** | `.go` |
| `rust` | Rust | **73** | rustc 1.40.0 (73528e339 2019-12-16) | **Enabled** | `.rs` |

*All language IDs verified against Judge0 CE v1.13.1 via `/languages` during Phase 4C.*

---

## 3. NestJS Language Translation Architecture

### Recommended TypeScript Definition
When implementing the Judge0 adapter in NestJS during Phase 4D, define an immutable mapping dictionary:

```typescript
export interface LanguageConfig {
  slug: string;
  displayName: string;
  judge0Id: number;
  isEnabled: boolean;
  version: string;
  sourceFilename: string;
  compilerOptions?: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  python: {
    slug: 'python',
    displayName: 'Python 3',
    judge0Id: 71,
    isEnabled: true,
    version: '3.8.1',
    sourceFilename: 'main.py',
  },
  cpp: {
    slug: 'cpp',
    displayName: 'C++ (GCC 9.2.0)',
    judge0Id: 54,
    isEnabled: true,
    version: '9.2.0',
    sourceFilename: 'main.cpp',
    compilerOptions: '-O3 -std=c++17',
  },
  java: {
    slug: 'java',
    displayName: 'Java (OpenJDK 13)',
    judge0Id: 62,
    isEnabled: true,
    version: '13.0.1',
    sourceFilename: 'Main.java',
  },
  javascript: {
    slug: 'javascript',
    displayName: 'JavaScript (Node.js 12)',
    judge0Id: 63,
    isEnabled: true,
    version: '12.14.0',
    sourceFilename: 'solution.js',
  },
  typescript: {
    slug: 'typescript',
    displayName: 'TypeScript 3.7',
    judge0Id: 74,
    isEnabled: true,
    version: '3.7.4',
    sourceFilename: 'solution.ts',
  },
  go: {
    slug: 'go',
    displayName: 'Go 1.13',
    judge0Id: 60,
    isEnabled: true,
    version: '1.13.5',
    sourceFilename: 'main.go',
  },
  rust: {
    slug: 'rust',
    displayName: 'Rust 1.40',
    judge0Id: 73,
    isEnabled: true,
    version: '1.40.0',
    sourceFilename: 'main.rs',
  },
};
```

---

## 4. Upgrade & Drift Verification Procedure

When upgrading Judge0 (e.g. from v1.13.1 to v1.14.x or v2.0):
1. **Never Assume Static IDs:** Upstream Judge0 releases frequently re-index language IDs when toolchains are added or removed.
2. **Automated Drift Check:** Implement a pre-flight probe in the NestJS initialization hook (`OnModuleInit`):
   ```typescript
   async onModuleInit() {
     const remoteLanguages = await this.judge0Client.getLanguages();
     for (const [slug, config] of Object.entries(SUPPORTED_LANGUAGES)) {
       const matched = remoteLanguages.find(l => l.id === config.judge0Id);
       if (!matched) {
         this.logger.warn(`Language mapping mismatch for ${slug}: ID ${config.judge0Id} not found in Judge0.`);
       }
     }
   }
   ```
3. **Admin Dashboard Reflection:** The NUMU frontend queries `GET /api/languages` which returns only the enabled subset of `SUPPORTED_LANGUAGES`.
