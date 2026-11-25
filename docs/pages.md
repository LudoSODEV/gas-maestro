# UI Pages & Navigation Mapping

This document outlines the user interface structure, page navigation, and component design for **Maestro**. 

> **Language Rule**: While the codebase, architecture, and documentation are written in English, the **User Interface (UI) is entirely in French**.

---

## 1. Global Application Layout (App Shell)

Every page in the application shares a consistent layout shell containing persistent global indicators and navigation:

- **Header / Top Bar**:
  - **Logged-in User Indicator**: Displays the currently authenticated Google Workspace account (e.g., `Utilisateur connecté: user@banquealimentaire.org`).
  - **Active Database Indicator**: Displays the currently selected active database (e.g., `Base de données active: DEMO`).
- **Sidebar Navigation (Menu principal)**:
  - **Gestion des bases de données** (Database Management)
  - **Profils de structures** (Structure Profiles)
  - **AssoConnect** (Data Validation & Anomalies)
  - **Administration** (General & Settings)

---

## 2. Database Management Page ("Gestion des bases de données")

This is the primary configuration and operational page for discovering, creating, selecting, and deleting regional databases (Google Sheets).

### 2.1 Page Header & Description
- **Title**: Gestion des bases de données
- **Description**: Gérez vos connexions aux feuilles de calcul Google Sheets agissant comme bases de données régionales.

### 2.2 Top Action Bar
- **Button 1**: `Rechercher les bases de données disponibles`
  - Scans Google Drive for files tagged with `MAESTRO_DATABASE_KEY` or matching branch naming conventions that the user has access to.
- **Button 2**: `Créer une base de données`
  - Creates a new Google Sheet database instance initialized with required schema and permissions.

### 2.3 Database List Table (`Tableau des bases de données`)
Displays all configured and discovered databases associated with the user account.

| Colonne (Column) | Description | Actions / Interactivity |
| :--- | :--- | :--- |
| **Nom de la base** | Display name (e.g., `DEMO`) | Link to open backing Google Sheets spreadsheet in a new tab (`Ouvrir`). |
| **Clé (Key)** | Identifier (e.g., `demo`) | Read-only badge. |
| **Identifiant du fichier** | Google Drive Spreadsheet ID | Read-only snippet. |
| **Statut actif** | Indicates if currently selected | Selection option / Radio / Button: `Sélectionner` (Set as active database). |
| **Actions** | Record management | Button: `Supprimer` (Remove from local user properties). |

---

## 3. Additional Module Pages (Future Scope)

- **Structure Profile (`Profils de structures`)**:
  - Lists regional data, associated Google Drive folders, external links (AssoConnect, Collecte), and alias management. Action buttons to provision Drive folders.
- **AssoConnect**:
  - Data sanity checks, anomaly listing (e.g., leading zeros in VIF codes), filtering per CAR.
- **Administration**:
  - Global settings and batch operations (e.g., batch-create Google Drive folders, review scheduling).
