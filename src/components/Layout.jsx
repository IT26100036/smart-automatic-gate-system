import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 240;

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
      <Sidebar width={SIDEBAR_WIDTH} />
      <Box component="main" sx={{ flexGrow: 1, ml: `${SIDEBAR_WIDTH}px`, p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
