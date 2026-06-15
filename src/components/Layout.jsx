import { Outlet, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Sidebar from './Sidebar';
import useLiveTime from '../hooks/useLiveTime';

const SIDEBAR_WIDTH = 240;

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/slots':     'Parking Slots',
  '/analytics': 'Analytics',
  '/logs':      'Activity Logs',
  '/clients':   'Clients',
  '/cards':     'Cards',
  '/settings':  'Settings',
};

export default function Layout() {
  const now = useLiveTime();
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] ?? 'ParkAdmin';

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
      <Sidebar width={SIDEBAR_WIDTH} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', ml: `${SIDEBAR_WIDTH}px` }}>
        {/* Topbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: -0.3 }}>
              {title}
            </Typography>

            <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />

            {/* Live clock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <AccessTimeIcon fontSize="small" color="primary" />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1.2} color="text.primary">
                  {timeStr}
                </Typography>
                <Typography variant="caption" lineHeight={1.2}>
                  {dateStr}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
