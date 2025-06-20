import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import React from 'react';


export default function CommonTopBar(): React.JSX.Element {
    return (<>
        <AppBar>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >

                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ADB工具箱
                </Typography>
                {/* <Button color="inherit">联系我们</Button> */}
            </Toolbar>
        </AppBar>
        <Toolbar />
    </>)
}
