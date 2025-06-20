import MiniDevice from 'src/shared/model/MiniDevice'
import { create } from 'zustand'

export enum AdbState {
  Default = -1,
  NotDetected = 0,
  Detected = 1,
  Error = 2
}

export interface AdbStore {
  adbState: AdbState
  adbDevices: DeviceCountResponse | null
  updateCheckAdbState: () => Promise<DeviceCountResponse>
}

interface DeviceCountResponse {
  success: boolean
  count: number
  error?: string
  devices?: MiniDevice[]
}



export const useAdbStore = create<AdbStore>((set) => ({
  adbState: AdbState.Default,
  adbDevices: null,
  updateCheckAdbState: async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('adb-get-device-count')
      set({ adbDevices: result })
      if (result.success) {
        set({ adbState: result.count > 0 ? AdbState.Detected : AdbState.NotDetected })
      } else {
        console.error('获取设备数量失败:', result.error)
        set({ adbState: AdbState.Error })
      }
      return result
    } catch (error) {
      console.error('IPC调用失败:', error)
      set({ adbState: AdbState.Error })
      return { success: false, count: 0, error: 'IPC调用失败', devices: null }
    }
  }
}))
