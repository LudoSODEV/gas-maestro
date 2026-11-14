/**
 * _Maestro.gs
 * Alphabetically first file evaluated by Google Apps Script.
 * Declares the single global namespace object: const Maestro = {};
 *
 * Architecture Decision:
 * Google Apps Script's execution environment (via google.script.run and doGet)
 * strictly requires top-level global functions to act as entry points.
 * To prevent namespace pollution and name collisions while satisfying GAS constraints,
 * all client-callable entry points are prefixed with "Maestro_" (except doGet)
 * and immediately delegate execution to the namespaced implementation (Maestro.Webapp).
 */
const Maestro = {};

function doGet (e)
{
	return Maestro.Webapp.doGet(e);
}

function Maestro_getUserDbs ()
{
	return Maestro.Webapp.getUserDbs();
}

function Maestro_saveUserDbs (dbs)
{
	return Maestro.Webapp.saveUserDbs(dbs);
}

function Maestro_getCurrentUserEmail ()
{
	return Maestro.Webapp.getCurrentUserEmail();
}

function Maestro_getOrCreateAutoDb ()
{
	return Maestro.Webapp.getOrCreateAutoDb();
}
