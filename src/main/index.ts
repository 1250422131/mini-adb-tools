import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createClient } from '@u4/adbkit'
import MiniDevice from '../shared/model/MiniDevice'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title:"MiniADBTools",
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.webContents.openDevTools()
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handler for getting device count
  ipcMain.handle('adb-get-device-count', async () => {
    const adbClient = createClient()
    try {
      const devices = await adbClient.listDevices()
      const newDevices = devices.map(async (device) => {
        const serialNo = await device.getClient().getSerialNo()
        return <MiniDevice>{
          id: device.id,
          type: device.type,
          serialNo: serialNo
        }
      })
      const finishDevices = await Promise.all(newDevices)
      return { success: true, count: devices.length, error: null, devices: finishDevices }
    } catch (error: any) {
      console.error('ADB检测失败:', error)
      return { success: false, error: error.message, count: 0 }
    }
  })

  ipcMain.on('open-apk-file-dialog', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'] // 只允许选择文件
    })
    if (!canceled && filePaths.length > 0) {
      // 将选中的文件路径发送回渲染进程
      event.reply('selected-apk-file', filePaths[0])
    }
  })

  ipcMain.handle('adb-log-connect', async (_, host: string, port: number) => {
    const adbClient = createClient()
    try {
      const result = await adbClient.connect(host, port)
      if (result) {
        return { msg: `设备：${host}:${port}-连接成功`, type: 'success' }
      } else {
        return { msg: `设备：${host}:${port}-已经在连接列表了`, type: 'warning' }
      }
    } catch (error: any) {
      return { msg: `设备：${host}:${port}-连接失败`, type: 'error' }
    }
  })

  ipcMain.handle('adb-install-apk', async (_, id: string, apkPath: string) => {
    const adbClient = createClient()
    try {

      let devices = await adbClient.listDevices()
      devices = devices.filter((device) => device.id === id)
      if (devices.length === 0) {
        return { msg: `设备：${id}-未找到`, type: 'error' }
      }
      const device = devices[0]
      const installResult = await device.getClient().install(apkPath)
      if (installResult) {
        return { msg: `设备：${id}-安装成功`, type: 'success' }
      } else {
        return { msg: `设备：${id}-安装失败`, type: 'error' }
      }
    } catch (error: any) {
      return { msg: `设备：${id}-安装失败,${error}`, type: 'error' }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
