"use strict";
/**
 * FileSniffer interface / base class
 * Namespace: Maestro.FileSniffers
 */
Maestro.FileSniffers = Maestro.FileSniffers || {};
Maestro.FileSniffers.FileSniffer = class FileSniffer {
    /**
     * Determines available actions for a given Google Drive File.
     * @param {GoogleAppsScript.Drive.File} file - The file to inspect.
     * @returns {string[]} Array of available action identifiers or descriptions.
     */
    getAvailableActions(file) {
        throw new Error('Method getAvailableActions() must be implemented by concrete file sniffers.');
    }
};
