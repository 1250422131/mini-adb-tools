import { app } from "electron";
import { join } from "path";

export function getScrpyPath(): string {
    // 判断平台
    const platform = process.platform;
    switch (platform) {
        case 'win32':
            return getScrpyPathStr('/scrcpy/scrcpy-win64-v3.3.1/scrcpy.exe');
        case 'darwin':
            const arch = process.arch;
            if (arch === 'arm64') {
                return getScrpyPathStr('/scrcpy/scrcpy-macos-arm64-v3.3.1/scrcpy');
            }
        case 'linux':
            return getScrpyPathStr('/scrcpy/scrcpy-linux-v3.3.1/scrcpy');
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

}

function getScrpyPathStr(path: string): string {
    if (app.isPackaged) {
        return join(app.getAppPath(), '../app.asar.unpacked/resources' + path);
    } else {
        return join(__dirname, '../../resources' + path);
    }
}