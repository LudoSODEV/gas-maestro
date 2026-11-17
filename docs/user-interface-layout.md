# User Interface Layout & Global Header Specification

## 1. Overview & Objectives
This document establishes the structural design and layout specifications for the **Maestro** Vue 3 Single Page Application (SPA). It serves as the blueprint for defining user interface elements, visual hierarchy, and component organization across all application views.

---

## 2. Global Persistent Header (Minimum Information per Page)

Every page in Maestro must render a unified global header at the top of the viewport. To maintain minimal cognitive overhead while providing essential operational context, the header displays two critical pieces of information:

### A. Current User Identity
- **Display Content**: The minimum readily available authenticated user metadata from Google Apps Script (`Session.getActiveUser().getEmail()`).
- **Format**: Plain text label indicating the active user (e.g., `Utilisateur connecté: user@ba13.banquealimentaire.org`).
- **Rationale**: Confirms immediately under which Google Workspace account and OAuth scope actions are executing.

### B. Active Database Indicator & Quick Management Link
- **Display Content**: The active database key (`dbKey`), prominently indicating the current data context (e.g., `Base active: ba13`).
- **Quick Action / Link**: A dedicated icon link (⚙️ or spreadsheet icon) placed next to the active database label. Clicking this link immediately routes the user to the **Database Management** page (`Gestion des bases de données`).
- **UX Realism**: While Maestro natively supports Multi-DB mapping for administrators or multi-branch managers, **the overwhelming majority of users will only ever use a single default database** (automatically provisioned via their email prefix, e.g., `ba13`). Therefore, the active database indicator remains compact and non-intrusive, while remaining instantly accessible for inspection or switching.

---

## 3. Persistent Layout Structure

```
+-----------------------------------------------------------------------------------+
|  MAESTRO - Centre de Contrôle                                                     |
|  [Utilisateur: user@ba13.org]   [Base active: ba13 (⚙️ Gérer)]                    |
+-----------------------------------------------------------------------------------+
|  [Sidebar Navigation]         |  [Main Content Area]                              |
|  - Menu Principal             |                                                   |
|    • Gestion des Dbs          |                                                   |
|    • Profils de structures    |     (Active component view renders here)          |
|    • Importations             |                                                   |
|    • AssoConnect              |                                                   |
|    • Administration           |                                                   |
+-------------------------------+---------------------------------------------------+
```
