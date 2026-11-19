// src/db-manager.ts
var DbManager = class _DbManager {
  static createDb(dbKey) {
    const normalizedDbKey = dbKey.toLowerCase();
    const ss = SpreadsheetApp.create("Maestro DB " + normalizedDbKey);
    const spreadsheetId = ss.getId();
    Drive.Files.update({
      properties: {
        MAESTRO_DATABASE_KEY: normalizedDbKey
      }
    }, spreadsheetId);
    const sheets = ss.getSheets();
    let parametersSheet;
    if (sheets.length > 0) {
      parametersSheet = sheets[0];
      parametersSheet.setName("Parameters");
    } else {
      parametersSheet = ss.insertSheet("Parameters");
    }
    parametersSheet.clear();
    parametersSheet.appendRow(["Key", "Value"]);
    parametersSheet.appendRow(["dbKey", normalizedDbKey]);
    const headerRange = parametersSheet.getRange(1, 1, 1, 2);
    headerRange.setFontWeight("bold");
    const allSheets = ss.getSheets();
    allSheets.forEach((sheet) => {
      const protection = sheet.protect().setDescription("Prevent accidental modifications");
      protection.setWarningOnly(true);
    });
    return {
      dbKey: normalizedDbKey,
      spreadsheetId
    };
  }
  static findDbByKey(dbKey) {
    const normalizedDbKey = dbKey.toLowerCase();
    const query = "properties has { key='MAESTRO_DATABASE_KEY' and value='" + normalizedDbKey + "' } and trashed = false";
    const result = Drive.Files.list({ q: query });
    if (result && result.files && result.files.length > 0) {
      const fileItem = result.files[0];
      return {
        dbKey: normalizedDbKey,
        spreadsheetId: fileItem.id
      };
    }
    return null;
  }
  static listAccessibleDbs() {
    const query = "properties has { key='MAESTRO_DATABASE_KEY' } and trashed = false";
    const result = Drive.Files.list({ q: query });
    const dbs = [];
    if (result && result.files) {
      result.files.forEach((item) => {
        if (item.properties && item.properties["MAESTRO_DATABASE_KEY"]) {
          dbs.push({
            dbKey: item.properties["MAESTRO_DATABASE_KEY"].toLowerCase(),
            spreadsheetId: item.id
          });
        }
      });
    }
    return dbs;
  }
  static getOrCreateDb(dbKey) {
    let db = _DbManager.findDbByKey(dbKey);
    if (!db) {
      db = _DbManager.createDb(dbKey);
    }
    return db;
  }
};

// src/webapp.ts
var Webapp = {
  doGet(e) {
    const params = e && e.parameter ? e.parameter : {};
    const template = HtmlService.createTemplateFromFile("index");
    template.initialParams = JSON.stringify(params);
    template.deploymentUrl = ScriptApp.getService().getUrl();
    return template.evaluate().setTitle("Maestro - Centre de Contr\xF4le").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },
  getUserDbs() {
    const props = PropertiesService.getUserProperties();
    const rawData = props.getProperty("MAESTRO_DATABASES");
    if (rawData) {
      return JSON.parse(rawData);
    }
    return [];
  },
  saveUserDbs(dbs) {
    const props = PropertiesService.getUserProperties();
    props.setProperty("MAESTRO_DATABASES", JSON.stringify(dbs));
    return { success: true };
  },
  getCurrentUserEmail() {
    return Session.getActiveUser().getEmail() || "Unknown user";
  },
  listAccessibleDbs() {
    return DbManager.listAccessibleDbs();
  },
  getOrCreateAutoDb() {
    const email = Session.getActiveUser().getEmail() || "";
    const match = email.match(/^(ba[0-9]+)\./i);
    if (!match) {
      throw new Error("User email not recognized for automatic database generation (expected format: baXX.*)");
    }
    const dbKey = match[1].toLowerCase();
    const dbs = Webapp.getUserDbs();
    let db = dbs.find((d) => d.dbKey === dbKey);
    if (db) {
      return db;
    }
    db = DbManager.findDbByKey(dbKey);
    if (db) {
      if (!dbs.some((d) => d.dbKey === dbKey)) {
        dbs.push(db);
        Webapp.saveUserDbs(dbs);
      }
      return db;
    }
    db = DbManager.createDb(dbKey);
    if (!dbs.some((d) => d.dbKey === dbKey)) {
      dbs.push(db);
      Webapp.saveUserDbs(dbs);
    }
    return db;
  }
};

// src/file-sniffers/file-sniffer.ts
var FileSniffer = class {
  getAvailableActions(file) {
    throw new Error("Method getAvailableActions() must be implemented by concrete file sniffers.");
  }
};

// src/file-sniffers/asso-connect-file-sniffer.ts
var AssoConnectFileSniffer = class extends FileSniffer {
  getAvailableActions(file) {
    return [
      "STUB_ACTION_ASSOCONNECT_IMPORT_MEMBERS",
      "STUB_ACTION_ASSOCONNECT_IMPORT_CONTRIBUTIONS"
    ];
  }
};

// src/_maestro.ts
var Maestro = {
  DbManager,
  Webapp,
  FileSniffers: {
    FileSniffer,
    AssoConnectFileSniffer
  }
};
global.Maestro = Maestro;
