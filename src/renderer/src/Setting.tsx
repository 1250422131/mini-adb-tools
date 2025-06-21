import AlertTitle from '@mui/material/AlertTitle';
import { useEffect, useState } from 'react';
import { useAdbStore, AdbState } from "./store/adbStore";
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import GitHubIcon from '@mui/icons-material/GitHub';




export default function Settings(): React.JSX.Element {

    // 检测ADB状态中
    const [isChecking, setIsChecking] = useState<boolean>(false)

    const adbStore = useAdbStore.getState()

    const [scrcpVersion, setSctrcpVersion] = useState<string>('');

    useEffect(() => {
        setIsChecking(true);
        adbStore.updateCheckAdbState().finally(() => {
            setIsChecking(false);
        });
    }, [])


    useEffect(() => {
        window.electron.ipcRenderer.invoke('scrcpy-version').then((result) => {
            if (result.success) {
                setSctrcpVersion(result.version);
            } else {
                setSctrcpVersion("获取失败，版本未知");
            }
        }).catch((error) => {
            setSctrcpVersion("获取失败，版本未知");
            console.log("获取 scrcpy 版本失败:", error);
        })

    }, []);

    const AdbStateTip = (adbState: AdbState) => {
        switch (adbState) {
            case AdbState.NotDetected:
                return <Alert severity="warning"  >
                    <AlertTitle>检测到ADB</AlertTitle>
                    但未连接任何设备，请确保设备已连接并开启USB调试模式。
                </Alert>
            case AdbState.Detected:
                return <Alert severity="success"  >
                    <AlertTitle>检测到ADB</AlertTitle>
                    目前有{adbStore.adbDevices?.count}台连接设备，现在你可以直接开始使用了。
                </Alert>
            case AdbState.Error:
                return <Alert severity="error"  >
                    <AlertTitle>未检测到ADB</AlertTitle>
                    联系管理员处理
                </Alert>
            default:
                return <Alert severity="info" >
                    <AlertTitle>未进行检测</AlertTitle>
                    请点击按钮进行检测
                </Alert>
        }
    }


    return (
        <div className="w-full h-full">
            <h1 className="text-3xl font-bold">设置</h1>
            <div className="mt-4 flex flex-col space-y-4">
                {AdbStateTip(adbStore.adbState)}
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                            setIsChecking(true);
                            await adbStore.updateCheckAdbState();
                            setIsChecking(false);
                        }}
                        loading={isChecking}
                        loadingPosition="start" >检测ADB</Button>
                </div>
                <h1 className="text-2xl font-bold">Scrcpy</h1>
                <Alert severity="info" >
                    <AlertTitle>Scrcpy - {scrcpVersion}</AlertTitle>
                    <div>
                        本项目采用 Scrcpy 作为屏幕投射工具，当前版本为 {scrcpVersion}。
                    </div>
                </Alert>
                <h2 className="text-2xl font-bold">项目相关</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Card variant="outlined" >
                        <CardActionArea >
                            <div className='flex p-4 items-center'>
                                <GitHubIcon fontSize="large" />
                                <div className='ml-5 '>
                                    <div className='text-1xl font-bold'>开源协议</div>
                                    <div>
                                        本项目采用 Apache-2.0 license 协议开源
                                    </div>
                                </div>
                            </div>


                        </CardActionArea>
                    </Card>

                </div>

            </div>
        </div>
    );
}
