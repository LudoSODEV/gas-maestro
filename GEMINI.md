# Project Instructions (gas-maestro)

## Naming Conventions
- **Files and Directories**: Use `kebab-case` (e.g., `vue3-frontend-specification.md`, `db-manager.gs`).
- **Classes and Constructors**: Use `PascalCase` (e.g., `DbManager`, `Webapp`).

## Architecture & Code Structure
- **Global Scope & Namespacing**: GAS evaluates files alphabetically. `_Maestro.gs` initializes `const Maestro = {};`. All modules and classes must be attached to the `Maestro` namespace (e.g., `Maestro.DbManager`).
- **Dual-Request Architecture**: Web App presentation requests (`doGet`) serve UI templates (Vue 3 Single Page Application), while API requests handle programmatic data endpoints.
- **Deployment**: Managed via Google Apps Script CLI (`clasp push`).
