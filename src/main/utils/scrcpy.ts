import { join } from "path";

export function getScrpyPath(): string {
    // 判断平台
    const platform = process.platform;
    switch (platform) {
        case 'win32':
            return join(__dirname, '../../resources/scrcpy/scrcpy-win64-v3.3.1/scrcpy.exe');
        case 'darwin':
            const arch = process.arch;
            if (arch === 'arm64') {
                return join(__dirname, '../../resources/scrcpy/scrcpy-macos-arm64-v3.3.1/scrcpy');
            }
        case 'linux':
            return join(__dirname, '../../resources/scrcpy/scrcpy-linux-v3.3.1/scrcpy');
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

}