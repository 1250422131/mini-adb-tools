import { ipcMain } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'
import { getScrpyPath } from '../utils/scrcpy'

export function registerScrcpyHandlers(): void {
    // 启动 scrcpy
    ipcMain.handle('scrcpy-start', async (_, deviceId: string) => {
        try {
            const scrcpyPath = getScrpyPath()
            // 构建命令参数
            const args: string[] = []
            // 添加其他选项
            //   if (options?.maxSize) args.push('-m', options.maxSize.toString())
            //   if (options?.bitRate) args.push('-b', options.bitRate.toString())
            //   if (options?.crop) args.push('--crop', options.crop)
            //   if (options?.recordFile) args.push('-r', options.recordFile)

            // 启动 scrcpy
            const scrcpyProcess = spawn(`${scrcpyPath} --serial=${deviceId}`, args, {
                shell: true,
                windowsHide: false
            })

            return {
                success: true,
                pid: scrcpyProcess.pid,
                message: `scrcpy 已启动，设备: ${deviceId}`
            }
        } catch (error: any) {
            return {
                success: false,
                message: `启动 scrcpy 失败: ${error.message}`
            }
        }
    })

    // 获取 scrcpy 版本信息
    ipcMain.handle('scrcpy-version', async () => {
        try {
            const scrcpyPath = join(__dirname, '../../resources/scrcpy/scrcpy-win64-v3.3.1/scrcpy.exe')

            return new Promise((resolve) => {
                const process = spawn(scrcpyPath, ['--version'], { shell: true, })

                let output = ''
                process.stdout.on('data', (data) => {
                    output += data.toString()
                })

                process.on('close', (code) => {
                    const regex = /scrcpy (\d+\.\d+\.\d+)/;
                    const match = output.match(regex);
                    resolve({
                        success: code === 0,
                        version: match && match[1] ? match[1] : '未知版本',
                    })
                })
            })
        } catch (error: any) {
            return {
                success: false,
                message: `获取版本失败: ${error.message}`
            }
        }
    })
}