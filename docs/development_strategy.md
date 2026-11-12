# Modular Development & Rollup Strategy

## 1. Overview & Motivation

As **Maestro** expands in functionality, maintaining all code in a single monolithic GAS project becomes challenging for separation of concerns and independent testing. However, leveraging **Google Apps Script (GAS) Libraries** introduces unacceptable execution latency due to inter-project RPC overhead and execution limits.

To balance clean modular separation with high-performance execution, Maestro adopts a **Monorepo Multi-Clasp Architecture** with a build-time rollup strategy.

---

## 2. Core Architectural Principles

### 2.1 Why Not GAS Libraries?
- **Latency Overhead**: GAS libraries execute in separate container contexts, incurring significant performance penalties per function call.
- **Strict Execution Quotas**: Excessive inter-library calls can trigger Google Apps Script execution time limits.
- **Solution**: Flattening all modules into a single monolithic deployment unit at build time eliminates library overhead while preserving clean source separation.

### 2.2 Directory Structure & Multi-Clasp Setup
The repository is organized into distinct module directories at the workspace root, alongside a unified distribution target (`dist/` or `src/`):

```text
gas-maestro/
├── .clasp.json (Master / Rollup project)
├── package.json
├── src/ (Unified Maestro application bundle)
│   ├── _Maestro.gs
│   ├── appsscript.json
│   └── ...
└── modules/
    ├── repository-manager/
    │   ├── .clasp.json (Bound to Test Sheet A)
    │   └── RepositoryManager.gs
    └── webapp/
        ├── .clasp.json (Bound to Test Sheet B)
        └── Webapp.gs
```

- **Independent Clasp IDs**: Each subdirectory under `modules/` possesses its own `.clasp.json` referencing a standalone Google Apps Script project.
- **Test Database Binding**: Each module's standalone GAS script is bound to a dedicated Google Sheet acting as an isolated test database for unit and integration testing.

---

## 3. Module Lifecycle & Testing Workflow

1. **Local Development**: Developers work on individual modules within their respective directories.
2. **Module Testing**: Each module is pushed via its local clasp configuration (`clasp push`) to its dedicated test spreadsheet/GAS container, enabling rapid, isolated testing and debugging.
3. **Independent Iteration**: Changes to a specific module do not risk cross-contamination or destabilization of other modules during early experimentation.

---

## 4. Rollup & Build Strategy

To produce the final **Maestro** application:
- **Concatenation & Namespace Organization**: All module source files are aggregated into the central application directory (`src/` or `dist/`).
- **Alphabetical Execution Order Compliance**: GAS executes `.gs` files alphabetically. The entry point (`_Maestro.gs`) initializes the global `Maestro` namespace object (`const Maestro = {};`), followed by modules attached as properties.
- **Single Deployment**: The unified bundle is deployed via the master `.clasp.json` configuration as the production-ready Maestro web application.
