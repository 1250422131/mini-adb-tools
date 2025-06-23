import { is } from '@electron-toolkit/utils';
import { BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path';
import icon from '../../../resources/icon.png?asset';

export function registerCommonHandlers(): void {
    ipcMain.on('open-url', (_, url) => {
        shell.openExternal(url);
    });


    // 启动窗口
    ipcMain.on('open-window-by-router', (_, url: string, title: string) => {
        const newWindow = new BrowserWindow({
            width: 1200,
            height: 670,
            show: true,
            autoHideMenuBar: true,
            title: title,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            }
        })
        newWindow.title = title;

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            newWindow.webContents.openDevTools()
            newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + "#/" + url);
        } else {
            newWindow.loadFile(join(__dirname, '../renderer/index.html') + "/#/" + url);
        }

    })
}