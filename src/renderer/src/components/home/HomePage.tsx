import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink, Outlet, useLocation } from 'react-router';
import CommonTopBar from '../CommonTopBar';
import DevicesIcon from '@mui/icons-material/Devices';

const navigateList = [
  { name: 'ADB配置', icon: <SettingsIcon />, route: '/' },
  { name: '批量连接', icon: <FileDownloadIcon />, route: '/tools/all-connect' },
  { name: '设备列表', icon: <DevicesIcon />, route: '/tools/devices' },
]

export default function HomePage() {
  const location = useLocation()
  return (
    <>
      <CommonTopBar />
      <div className='w-full h-full grid grid-cols-8 gap-4 mt-4'>
        <div className='col-span-2 h-full content-stretch'>
          <nav>
            <List >
              {navigateList.map((item, index) => (
                <ListItem disablePadding key={index}>
                  <NavLink className='w-full' to={item.route} end>
                    <ListItemButton selected={location.pathname === item.route}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  </NavLink>
                </ListItem>
              ))}
            </List>
          </nav>
        </div>
        <div className='col-span-6 h-full w-full pl-2 pt-2 pb-6 pr-6'>
          <Outlet />
        </div>
      </div>
    </>
  )
}