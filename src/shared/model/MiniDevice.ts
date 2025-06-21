
export default interface MiniDevice {
    id: string;
    type: string;
    serialNo: string;
    properties: Record<string, string>;
 }