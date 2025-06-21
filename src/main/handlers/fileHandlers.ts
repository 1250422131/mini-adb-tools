import { ipcMain, dialog } from 'electron'

export function registerFileHandlers(): void {
  // 打开 APK 文件选择对话框
  ipcMain.on('open-apk-file-dialog', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'APK Files', extensions: ['apk'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (!canceled && filePaths.length > 0) {
      // 将选中的文件路径发送回渲染进程
      event.reply('selected-apk-file', filePaths[0])
    }
  })

  // 可以添加其他文件相关的处理器
  // 比如：保存文件、读取文件等
}