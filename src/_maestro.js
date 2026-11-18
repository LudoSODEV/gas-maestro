"use strict";
/**
 * _Maestro.ts
 * Alphabetically first file evaluated by Google Apps Script.
 * Declares the single global namespace object: const Maestro = {};
 */
const Maestro = {};
function doGet(e) {
    return Maestro.Webapp.doGet(e);
}
function Maestro_getUserDbs() {
    return Maestro.Webapp.getUserDbs();
}
function Maestro_saveUserDbs(dbs) {
    return Maestro.Webapp.saveUserDbs(dbs);
}
function Maestro_getCurrentUserEmail() {
    return Maestro.Webapp.getCurrentUserEmail();
}
function Maestro_listAccessibleDbs() {
    return Maestro.Webapp.listAccessibleDbs();
}
function Maestro_getOrCreateAutoDb() {
    return Maestro.Webapp.getOrCreateAutoDb();
}
