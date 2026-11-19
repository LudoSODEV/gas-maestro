# Vue 3 Frontend & Dual-Request Architecture Specification

## 1. Overview & Objectives

This document specifies the integration of **Vue 3**, **Vite**, and **`vite-plugin-singlefile`** into **`gas-maestro`**, drawing from the proven patterns established in `ext/gas-vue-demo`. 

The architecture bridges modern Single Page Application (SPA) development with the strict execution constraints of Google Apps Script (GAS), supporting two distinct request modalities:
1. **Web App Presentation Requests**: Serving the fully reactive Vue 3 user interface via `HtmlService`.
2. **API Requests**: Serving programmatic data endpoints (reserved for subsequent implementation phases).

---

## 2. Dual-Request Routing Architecture (`doGet` & API Dispatcher)

Google Apps Script web applications rely on standard entry points like `doGet(e)` and `doPost(e)` to handle HTTP traffic. In `gas-maestro`, the backend must distinguish between browser-based UI requests and programmatic API calls.

### 2.1 Request Routing Strategy in `webapp.gs`

```javascript
Maestro.Webapp = {
  doGet(e) {
    const params = e && e.parameter ? e.parameter : {};

    // Check if the request is an API call
    if (params.action === 'api') {
      return Maestro.Webapp.handleApiRequest(params);
    }

    // Default: Serve Vue 3 Web App Presentation Layer
    const template = HtmlService.createTemplateFromFile('index');
    
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

## 3. Frontend Security & Third-Party Dependencies

To maintain absolute system integrity and protect against supply-chain vulnerabilities or arbitrary code injection within the GAS container sandbox:
- **Strict Version Pinning**: Any resource requested from a third-party domain (such as CDNs, external stylesheets, or external JavaScript libraries) **must be strictly pinned to an explicit, immutable version number** (e.g., `https://cdn.jsdelivr.net/npm/package@1.2.3/file.js`). Floating versions, wildcards, or `latest` tags are strictly prohibited.
- **Subresource Integrity (SRI)**: All third-party script and style tags must include a valid cryptographic **Subresource Integrity (SRI) hash** (`integrity="..."`) and `crossorigin="anonymous"` attribute to ensure the browser verifies that fetched files have not been unexpectedly manipulated.

---

## 4. Frontend Build & Bundling Setup

To avoid multi-file asset loading overhead and CORS limitations inside GAS `iframe` sandboxes, all Vue components, styles, and assets are bundled into a single standalone HTML file (`index.html`) at build time.

### 4.1 Project Layout

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
│   ├── Maestro.ts          # Root namespace and entry point
│   ├── Webapp.ts           # Request dispatcher (doGet / API)
│   ├── DbManager.ts        # Backend data logic
│   └── index.html          # Bundled Vue SPA output (in `dist/`)
└── package.json            # Root build & clasp scripts
```

### 4.2 Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'frontend'),
  plugins: [vue(), viteSingleFile()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
```

---

## 5. Stateful URL Routing & `google.script.history`

Standard HTML5 `history.pushState` fails to update the top-level browser address bar when executed within a GAS `<iframe>`. Furthermore, relative URLs resolve incorrectly to `script.googleusercontent.com`.

### 5.1 Server-Side Injection (`index.html` template variables)

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

### 5.2 Client-Side History Synchronization (`App.vue`)

- **Top-Level Address Bar Sync**: Uses `google.script.history.push` / `replace` when running inside GAS, falling back to standard `history.pushState` during local Vite development.
- **Absolute Deployment URLs**: All navigation links (`href`) are prefixed with `window.DEPLOYMENT_URL`, ensuring middle-clicks and "Open in new tab" function correctly without sandboxed URL corruption.

---

## 6. Development & Deployment Workflow

1. **Local Development (Frontend Vite Server)**:
   ```bash
   npm run dev
   ```
2. **Build Project**:
   ```bash
   npm run build
   ```
   *(Builds Vue 3 single-file HTML, bundles TypeScript backend, and outputs to `dist/`)*
3. **Deploy via Clasp**:
   ```bash
   npm run push
   ```
