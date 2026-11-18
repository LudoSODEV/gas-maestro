"use strict";
/**
 * AssoConnectFileSniffer class
 * Concrete file sniffer for AssoConnect files.
 * Namespace: Maestro.FileSniffers
 */
Maestro.FileSniffers = Maestro.FileSniffers || {};
Maestro.FileSniffers.AssoConnectFileSniffer = class AssoConnectFileSniffer extends Maestro.FileSniffers.FileSniffer {
    /**
     * Gets available actions for an AssoConnect file (stubbed).
     * @param {GoogleAppsScript.Drive.File} file - The file to inspect.
     * @returns {string[]} Array of stubbed actions.
     */
    getAvailableActions(file) {
        // Stub implementation for AssoConnect file sniffer
        return [
            'STUB_ACTION_ASSOCONNECT_IMPORT_MEMBERS',
            'STUB_ACTION_ASSOCONNECT_IMPORT_CONTRIBUTIONS'
        ];
    }
};
