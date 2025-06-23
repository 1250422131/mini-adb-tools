import { DeviceWithPath } from "@u4/adbkit";

export default interface MoreDevice {
    serialNo: string;
    properties: Record<string, string>;
    // 设备状态
    state: DeviceWithPath['path'];
    name: string;
    manufacturer: string;
    

}