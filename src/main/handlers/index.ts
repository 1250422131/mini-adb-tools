import { ipcMain } from 'electron'
import { registerAdbHandlers } from './adbHandlers'
import { registerScrcpyHandlers } from './scrcpyHandlers'
import { registerFileHandlers } from './fileHandlers'
import { registerCommonHandlers } from './commonHandlers'

export function registerAllHandlers(): void {
  // 注册基础 IPC
  ipcMain.on('ping', () => console.log('pong'))
  
  // 注册各模块的 handlers
  registerAdbHandlers()
  registerScrcpyHandlers()
  registerFileHandlers()
  registerCommonHandlers()
}