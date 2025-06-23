import {  useEffect, useState } from "react";
import { useParams } from "react-router";
import MoreDevice from "src/shared/model/MoreDevice";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AndroidIcon from '@mui/icons-material/Android';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { PackageInfo } from "@u4/adbkit";


export default function DeviceInfo(): React.JSX.Element {
    // 获取react-router的路由id参数
    const { id } = useParams<{ id: string }>();
    const [deviceInfo, setDeviceInfo] = useState<MoreDevice | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [pageIdex, setPageIndex] = useState<number>(0);
    const [appList, setAppList] = useState<PackageInfo[]>([]); // 设备程序列表

    useEffect(() => {
        const fetchAppList = async () => {
            try {
                const apps = await window.electron.ipcRenderer.invoke('adb-get-device-apps', id);
                if (apps.success) {
                    setAppList(apps.appInfos);
                } else {
                    console.error('获取设备程序列表失败:', apps.error);
                }
            } catch (error) {
                console.error('获取设备程序列表失败:', error);
            }
        };

        fetchAppList();
    }, [])

    useEffect(() => {
        const fetchDeviceInfo = async () => {
            try {
                const info = await window.electron.ipcRenderer.invoke('adb-get-device-info', id);
                if (info.success) {
                    setDeviceInfo(info.deviceInfo);
                } else {
                    console.error('获取设备信息失败:', info.error);
                }
            } catch (error) {
                console.error('获取设备信息失败:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDeviceInfo();
    }, []);

    if (isLoading) {
        return <div>加载中...</div>;
    }

    if (!deviceInfo) {
        return <Container>未检测到设备信息</Container>;
    }

    const handleTabChange = (_, newValue: number) => {
        setPageIndex(newValue);
    };

    return (
        <div className="h-full">
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {deviceInfo.name}
                    </Typography>
                    {/* <Button color="inherit">联系我们</Button> */}
                </Toolbar>
            </AppBar>
            <Toolbar />

            <div className="m-4 flex h-full">
                <div className="p-2 flex-2/8">
                    <Card variant="outlined" className="p-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <AndroidIcon />
                                <div >设备信息</div>
                            </div>
                            <div className="text-sm flex justify-between items-center ">
                                <div className=" text-gray-400">型号</div>
                                <div className=" font-bold">
                                    {deviceInfo.properties['ro.product.model']}
                                </div>
                            </div>
                            <div className="text-sm flex justify-between items-center ">
                                <div className=" text-gray-400">厂商</div>
                                <div className=" font-bold">
                                    {deviceInfo.properties['ro.product.brand']}
                                </div>
                            </div>
                            <div className="text-sm flex justify-between items-center ">
                                <div className=" text-gray-400">架构</div>
                                <div className=" font-bold">
                                    {deviceInfo.properties['ro.product.cpu.abi']}
                                </div>
                            </div>
                            <div className="text-sm flex justify-between items-center ">
                                <div className=" text-gray-400">Android版本</div>
                                <div className=" font-bold">
                                    {deviceInfo.properties['ro.build.version.release']}
                                </div>
                            </div>
                            <div className="text-sm flex justify-between items-center ">
                                <div className=" text-gray-400">序列号</div>
                                <div className=" font-bold">
                                    {deviceInfo.serialNo}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="w-10" />

                <div className="flex-6/8 flex flex-col gap-4">
                    <Tabs value={pageIdex} onChange={handleTabChange} aria-label="lab API tabs example">
                        <Tab label="设备程序" value={0} />
                        <Tab label="设备文件" value={1} />
                        <Tab label="远程视图" value={2} />
                    </Tabs>

                    <Card variant="outlined" className="p-2 flex-1 flex flex-col  ">
                        <List 
                            className="max-h-[80vh] overflow-y-auto"
                        >
                            {appList.map((app, index) => (
                                <ListItem
                                    key={index}
                                    divider
                                    secondaryAction={
                                        <button
                                            className="text-red-500 hover:underline"
                                            onClick={() => {
                                                // 卸载逻辑
                                            }}
                                        >
                                            卸载
                                        </button>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <span className="font-bold">
                                                {app.pkg}
                                            </span>
                                        }
                                        secondary={
                                            <>
                                                <span className="text-gray-500">
                                                    系统程序: {app.codePath.startsWith("/system") ? '是' : '否'}
                                                </span>
                                                <br />
                                                <span className="text-gray-500">
                                                    版本: {app.versionName} ({app.versionCode})
                                                </span>
                                                <br />
                                                <span className="text-gray-400">
                                                    安装时间: {app.firstInstallTime}
                                                </span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </div>
            </div>
        </div>
    );
}