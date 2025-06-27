import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState } from 'react';
import { useAdbStore } from '@renderer/store/adbStore';

export default function AllConnect() {

  const [filePath, setFilePath] = useState<string>('');

  const [ipList, setIpList] = useState<string>('');

  const [log, setLog] = useState<{
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
  }[]>([]);

  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scrollRef = useRef<HTMLUListElement>(null);

  const adbStore = useAdbStore.getState()

  // 连接成功个数
  const [successCount, setSuccessCount] = useState<number>(0);
  // 连接失败个数
  const [failCount, setFailCount] = useState<number>(0);

  useEffect(() => {
    adbStore.updateCheckAdbState()
  }, [])


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

  useEffect(() => {
    // 添加新日志时自动滚动到底部
    if (scrollRef.current && isAutoScroll) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, [log]);


  const handleConnect = async () => {
    setIsLoading(true);
    const ips = ipList.split('\n').map(ip => ip.trim()).filter(ip => ip);
    // 切割端口和host
    setFailCount(0);
    setSuccessCount(0);
    await (async () => {
      for (const ip of ips) {
        let [host, port] = ip.split(':');
        if (!port) {
          port = '5555'; // 默认端口
        }
        setLog((prevLogs) => [...prevLogs, { type: "info", message: `设备：${host}:${port}-开始连接...` }]);
        const result = await window.electron.ipcRenderer.invoke('adb-log-connect', host, parseInt(port));
        if (result.type === 'success' || result.type === 'warning') {
          setSuccessCount(prev => prev + 1);
        } else {
          setFailCount(prev => prev + 1);
        }
        setLog((prevLogs) => [...prevLogs, { type: result.type, message: result.msg }]);
        await adbStore.updateCheckAdbState();
      }
    })();

    setIsLoading(false);
  }

  const handleLogScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // 判断是否滚动到底部（允许 5px 的误差）
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 5;

    // 只有当滚动状态发生变化时才更新状态
    setIsAutoScroll(isAtBottom);

  };

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold">批量连接（一行一个）</h1>
      <div className="mt-4 flex flex-col space-y-4">
        <div>当前设备个数：{adbStore.adbDevices?.count}</div>
        <TextField
          label="IP列表"
          multiline
          minRows={4}
          maxRows={6}
          defaultValue=""
          onChange={(e) => setIpList(e.target.value)}
        />
        <Box className='mt-3 flex gap-4 items-center'>
          <Button variant="contained"
            loading={isLoading}
            loadingPosition="start"
            color="primary" onClick={handleConnect}>连接</Button>
          <div>
            连接成功（含重复连接）：{successCount}个
          </div>
          <div>
            连接失败：{failCount}个
          </div>
        </Box>

        <Card variant="outlined" >
          <Box className='p-4'>
            <h2 className='text-lg font-semibold'>连接日志</h2>
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
          <Card variant="outlined" >
            <Box className='p-4'>
              <h2 className='text-lg font-semibold'>已选择安装包</h2>
              <p className='text-sm text-gray-600'>{filePath}</p>
            </Box>
          </Card> : <></>}


      </div>
    </div>
  );
}

