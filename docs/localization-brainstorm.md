# Localization (i18n) Brainstorming & Architecture

## 1. Objectives & Constraints
- **Goal**: Localize the **Maestro** Vue 3 SPA and Google Apps Script backend into French (primary) and potential future languages (e.g., English).
- **Core Constraints**:
  - Keep the solution extremely lightweight (no heavy third-party i18n libraries if native or tiny dictionary objects suffice).
  - Must operate seamlessly inside the single-file bundled Google Apps Script `HtmlService` runtime.
  - Zero performance overhead and zero complex build tooling.

---

## 2. Proposed Lightweight Solutions

### Approach A: Vanilla JavaScript / Vue Composition Function (`useI18n`)
A simple dictionary-based object store managed via a Vue composition function or reactive global ref.

#### **Implementation Concept**
1. Create a dictionary module (`src/i18n/locales.js`):
   ```javascript
   export const messages = {
     fr: {
       appTitle: 'Maestro — Banque Alimentaire',
       databases: 'Gestion des bases de données',
       structures: 'Profils de structures',
       assoconnect: 'AssoConnect',
       admin: 'Administration',
       currentUser: 'Utilisateur connecté',
       activeDb: 'Base active',
       save: 'Enregistrer les modifications',
       loading: 'Chargement en cours...'
     },
     en: {
       appTitle: 'Maestro — Food Bank',
       databases: 'Database Management',
       structures: 'Structure Profiles',
       assoconnect: 'AssoConnect',
       admin: 'Administration',
       currentUser: 'Current User',
       activeDb: 'Active Database',
       save: 'Save Changes',
       loading: 'Loading...'
     }
   };
   ```
2. Create a lightweight composable (`useI18n.js`):
   ```javascript
   import { ref } from 'vue';
   import { messages } from './locales';

   const locale = ref('fr'); // Default to French

   export function useI18n() {
     const t = (key) => {
       return messages[locale.value]?.[key] || messages['fr']?.[key] || key;
     };

     const setLocale = (lang) => {
       if (messages[lang]) {
         locale.value = lang;
       }
     };

     return { locale, t, setLocale };
   }
   ```

### Approach B: Server-Side Localization Injection via GAS Properties
Leveraging Google Apps Script user properties or script properties to determine the user's preferred locale or default regional language upon `doGet()` initialization.

---

## 3. Recommended Strategy
Given that Maestro is primarily deployed for French-speaking Banque Alimentaire branches (`fr` is the default UI language), **Approach A** provides the cleanest balance of simplicity, reactivity, and zero runtime dependencies.
