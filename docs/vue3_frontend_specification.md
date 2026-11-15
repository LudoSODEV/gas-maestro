# Vue 3 Frontend & Dual-Request Architecture Specification

## 1. Overview & Objectives

This document specifies the integration of **Vue 3**, **Vite**, and **`vite-plugin-singlefile`** into **`gas-maestro`**, drawing from the proven patterns established in `ext/gas-vue-demo`. 

The architecture bridges modern Single Page Application (SPA) development with the strict execution constraints of Google Apps Script (GAS), supporting two distinct request modalities:
1. **Web App Presentation Requests**: Serving the fully reactive Vue 3 user interface via `HtmlService`.
2. **API Requests**: Serving programmatic data endpoints (reserved for subsequent implementation phases).

---

## 2. Dual-Request Routing Architecture (`doGet` & API Dispatcher)

Google Apps Script web applications rely on standard entry points like `doGet(e)` and `doPost(e)` to handle HTTP traffic. In `gas-maestro`, the backend must distinguish between browser-based UI requests and programmatic API calls.

### 2.1 Request Routing Strategy in `Webapp.gs`

```javascript
Maestro.Webapp = {
  doGet(e) {
    const params = e && e.parameter ? e.parameter : {};

    // Check if the request is an API call
    if (params.action === 'api') {
      return Maestro.Webapp.handleApiRequest(params);
    }

    // Default: Serve Vue 3 Web App Presentation Layer
    const template = HtmlService.createTemplateFromFile('Index');
    
    template.initialParams = JSON.stringify(params);
    template.deploymentUrl = ScriptApp.getService().getUrl();
    
    return template.evaluate()
      .setTitle('Maestro - Application')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  handleApiRequest(params) {
    // API handling logic (to be implemented in subsequent phases)
    const response = { status: 'success', endpoint: params.endpoint || 'unknown' };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
};
```

---

## 3. Frontend Build & Bundling Setup

To avoid multi-file asset loading overhead and CORS limitations inside GAS `iframe` sandboxes, all Vue components, styles, and assets are bundled into a single standalone HTML file (`Index.html`) at build time.

### 3.1 Project Layout

```text
gas-maestro/
├── frontend/               # Vue 3 source code
│   ├── index.html          # HTML entry point with GAS injection stubs
│   ├── src/
│   │   ├── App.vue         # Root component with stateful routing
│   │   ├── main.js         # Vue app initialization
│   │   └── components/     # Feature components (Databases, Tools, etc.)
│   └── package.json        # Frontend dependencies (Vue 3, Vite)
├── src/                    # GAS Backend & Bundled Output
│   ├── _Maestro.gs         # Root namespace
│   ├── Webapp.gs           # Request dispatcher (doGet / API)
│   ├── DbManager.gs        # Backend data logic
│   └── Index.html          # Bundled Vue SPA output
└── package.json            # Root build & clasp scripts
```

### 3.2 Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'frontend'),
  plugins: [vue(), viteSingleFile()],
  build: {
    outDir: resolve(__dirname, 'dist-frontend'),
    emptyOutDir: true
  }
})
```

---

## 4. Stateful URL Routing & `google.script.history`

Standard HTML5 `history.pushState` fails to update the top-level browser address bar when executed within a GAS `<iframe>`. Furthermore, relative URLs resolve incorrectly to `script.googleusercontent.com`.

### 4.1 Server-Side Injection (`Index.html` template variables)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Maestro</title>
  <script>
    window.INITIAL_PARAMS = <?!= typeof initialParams !== 'undefined' ? initialParams : '{}' ?>;
    window.DEPLOYMENT_URL = <?!= typeof deploymentUrl !== 'undefined' ? JSON.stringify(deploymentUrl) : '""' ?>;
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### 4.2 Client-Side History Synchronization (`App.vue`)

- **Top-Level Address Bar Sync**: Uses `google.script.history.push` / `replace` when running inside GAS, falling back to standard `history.pushState` during local Vite development.
- **Absolute Deployment URLs**: All navigation links (`href`) are prefixed with `window.DEPLOYMENT_URL`, ensuring middle-clicks and "Open in new tab" function correctly without sandboxed URL corruption.

---

## 5. Development & Deployment Workflow

1. **Local Development (Frontend Vite Server)**:
   ```bash
   npm run dev
   ```
2. **Build Frontend & Update GAS Template**:
   ```bash
   npm run build:frontend
   ```
   *(Builds Vue 3, inlines assets via `vite-plugin-singlefile`, and copies output to `src/Index.html`)*
3. **Deploy via Clasp**:
   ```bash
   npm run push
   ```
