import { ipcMain } from 'electron'
import MiniDevice from '../../shared/model/MiniDevice'
import adbClient from '../utils/adbClient'

export function registerAdbHandlers(): void {
    // 获取设备列表
    ipcMain.handle('adb-get-device-count', async () => {
        try {

            const devices = await adbClient.listDevices()
            const newDevices = devices.map(async (device) => {
                const deviceClient = device.getClient()
                const serialNo = await deviceClient.getSerialNo()
                const props = await deviceClient.getProperties();
                return <MiniDevice>{
                    id: device.id,
                    type: device.type,
                    serialNo: serialNo,
                    properties: props,
                }
            })
            const finishDevices = await Promise.all(newDevices)
            return { success: true, count: devices.length, error: null, devices: finishDevices }
        } catch (error: any) {
            console.error('ADB检测失败:', error)
            return { success: false, error: error.message, count: 0 }
        }
    })

    // 连接设备
    ipcMain.handle('adb-log-connect', async (_, host: string, port: number) => {
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

    // 安装APK
    ipcMain.handle('adb-install-apk', async (_, id: string, apkPath: string) => {
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

    ipcMain.handle('adb-devices-shell', async (_, id: string, command: string) => {
        try {
            const res = await adbClient.getDevice(id).shell(command)
            let output = ''
            res.on('data', (data: Buffer) => {
                output += data.toString()
            })
            return new Promise((resolve) => {
                res.on('end', () => {
                    resolve({ success: true, output: output.trim() })
                })
            })
        } catch (error: any) {
            console.error(`设备：${id}-执行命令失败:`, error)
            return { success: false, message: `执行命令失败: ${error.message}` }
        }
    })
}