import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useAdbStore } from '@renderer/store/adbStore';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import { useState, useEffect, useRef } from 'react';
import MiniDevice from 'src/shared/model/MiniDevice';

export default function Devices(): React.JSX.Element {
    const adbStore = useAdbStore.getState();
    const [selectedDevices, setSelectedDevices] = useState<MiniDevice[]>([]);

    const devices = adbStore.adbDevices?.devices || [];
    const isAllSelected = devices.length > 0 && selectedDevices.length === devices.length;
    const isIndeterminate = selectedDevices.length > 0 && selectedDevices.length < devices.length;

    const [log, setLog] = useState<{
        type: 'info' | 'error' | 'success' | 'warning';
        message: string;
    }[]>([]);

    const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const scrollRef = useRef<HTMLUListElement>(null);

    const [filePath, setFilePath] = useState<string>('');


    useEffect(() => {
        setSelectedDevices([]);
    }, [adbStore.adbDevices?.devices]);

    useEffect(() => {
        // 监听主进程发送的文件路径
        window.electron.ipcRenderer.on('selected-apk-file', (_, path) => {
            setFilePath(path);
        });

        // 组件卸载时移除监听器
        return () => {
            window.electron.ipcRenderer.removeAllListeners('selected-file');
        };
    }, []);

    // 选择安装包
    const handleOpenFileDialog = () => {
        // 向主进程发送文件选择请求
        window.electron.ipcRenderer.send('open-apk-file-dialog');
    };


    // 处理全选/取消全选
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allDeviceIds = devices
            setSelectedDevices(allDeviceIds);
        } else {
            setSelectedDevices([]);
        }
    };

    // 处理单个设备选择
    const handleSelectDevice = (device: MiniDevice) => {
        setSelectedDevices(prevSelected => {
            if (prevSelected.includes(device)) {
                return prevSelected.filter(item => item !== device);
            } else {
                return [...prevSelected, device];
            }
        });
    };


    const handleLogScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // 判断是否滚动到底部（允许 5px 的误差）
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 5;

        // 只有当滚动状态发生变化时才更新状态
        setIsAutoScroll(isAtBottom);

    };


    const handleApkInstall = async () => {
        setIsLoading(true);
        // 切割端口和host
        await (async () => {
            for (const device of selectedDevices) {
                setLog((prevLogs) => [...prevLogs, { type: "info", message: `设备：${device.id}-开始安装...` }]);
                const result = await window.electron.ipcRenderer.invoke('adb-install-apk', device.id, filePath);
                setLog((prevLogs) => [...prevLogs, { type: result.type, message: result.msg }]);
            }
        })();

        setIsLoading(false);
    }

    useEffect(() => {
        // 添加新日志时自动滚动到底部
        if (scrollRef.current && isAutoScroll) {
            const scrollElement = scrollRef.current;
            setTimeout(() => {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }, 100);
        }
    }, [log]);

    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold">设备管理</h1>
            <div className='mt-4'>
                <TableContainer component={Paper}>
                    <Table sx={{ maxHeight: 300 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={isIndeterminate}
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        disabled={devices.length === 0}
                                    />
                                </TableCell>
                                <TableCell>设备ID（IP）</TableCell>
                                <TableCell>设备类型</TableCell>
                                <TableCell>设备序列号</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {devices.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedDevices.includes(row)}
                                            onChange={() => handleSelectDevice(row)}
                                        />
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.id}
                                    </TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.serialNo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            <Card variant="outlined" className='mt-4' >
                <Box className='p-4'>
                    <h2 className='text-lg font-semibold'>操作日志</h2>
                    <ul className='max-h-80 overflow-y-auto overscroll-contain'
                        ref={scrollRef}
                        onScroll={handleLogScroll}
                    >
                        {log.map((item, index) => (
                            <li
                                key={index}
                                className={`
                                    text-sm
                                    ${item.type === 'error' ? 'text-red-500' : ''}
                                    ${item.type === 'success' ? 'text-green-500' : ''}
                                    ${item.type === 'warning' ? 'text-yellow-500' : ''}
                                    ${item.type === 'info' ? 'text-gray-700' : ''}
                                `}
                            >
                                {item.message}
                            </li>
                        ))}
                    </ul>
                    <div className='flex mt-2'>
                        <Tooltip title="清空日志">
                            <IconButton onClick={() => setLog([])} >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Box>
            </Card>


            {filePath != '' ?
                <Card variant="outlined" className='mt-4' >
                    <Box className='p-4'>
                        <h2 className='text-lg font-semibold'>已选择安装包</h2>
                        <p className='text-sm text-gray-600'>{filePath}</p>
                    </Box>
                </Card> : <></>}


            <Box className='mt-4 flex '>
                <Button variant="contained" disabled={selectedDevices.length === 0 || isLoading}
                    color="primary" onClick={handleOpenFileDialog}>选则安装包</Button>

                <div className='w-4'></div>

                <Button variant="contained" disabled={selectedDevices.length === 0 || filePath === '' || isLoading}
                    loading={isLoading}
                    loadingPosition='start'
                    color="primary" onClick={async () => {
                        await handleApkInstall();
                    }}>批量安装</Button>
            </Box>
        </div>
    )
}