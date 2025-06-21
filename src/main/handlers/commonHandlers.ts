import { ipcMain, shell } from 'electron'

export function registerCommonHandlers(): void {
    ipcMain.on('open-url', (_, url) => {
        shell.openExternal(url);
    });
}