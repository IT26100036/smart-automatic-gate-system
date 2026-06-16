import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Divider,
  Breadcrumbs, IconButton, Badge, Tooltip, InputBase,
  Popover, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Sidebar from './Sidebar';
import useLiveTime from '../hooks/useLiveTime';
import { useThemeToggle } from '../context/ThemeContext';

const SIDEBAR_WIDTH = 240;

const NAV_META = {
  '/dashboard': { label: 'Dashboard',     icon: 'solar:home-angle-bold-duotone' },
  '/slots':     { label: 'Slots',         icon: 'solar:widget-bold-duotone' },
  '/analytics': { label: 'Analytics',     icon: 'solar:chart-bold-duotone' },
  '/logs':      { label: 'Activity Logs', icon: 'solar:history-bold-duotone' },
  '/clients':   { label: 'Clients',       icon: 'solar:users-group-rounded-bold-duotone' },
  '/cards':     { label: 'Cards',         icon: 'solar:card-bold-duotone' },
  '/settings':  { label: 'Settings',      icon: 'solar:settings-bold-duotone' },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: 'solar:car-bold-duotone',    color: '#f97316', text: 'New vehicle entry — Slot A2', time: '2 min ago' },
  { id: 2, icon: 'solar:card-bold-duotone',   color: '#1877F2', text: 'Card #A7D02349 activated',    time: '15 min ago' },
  { id: 3, icon: 'solar:bell-bold-duotone',   color: '#10b981', text: 'Daily revenue target reached', time: '1 hr ago' },
  { id: 4, icon: 'solar:user-bold-duotone',   color: '#8b5cf6', text: 'New client registered',       time: '3 hr ago' },
];

export default function Layout() {
  const now = useLiveTime();
  const { pathname } = useLocation();
  const { toggleTheme, mode } = useThemeToggle();

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [readIds, setReadIds] = useState([]);

  const current = NAV_META[pathname];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const unread = MOCK_NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length;

  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget);
    setReadIds(MOCK_NOTIFICATIONS.map(n => n.id));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh', bgcolor: 'background.default' }}>
      <Sidebar width={SIDEBAR_WIDTH} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100svh', overflow: 'hidden' }}>
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
          <Toolbar sx={{ gap: 1 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ flexShrink: 0 }} aria-label="breadcrumb">
              <Box
                component={Link}
                to="/dashboard"
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  color: 'text.secondary', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Icon icon="solar:home-angle-linear" width={16} />
                Home
              </Box>
              {current && (
                <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main', fontSize: 13 }}>
                  {current.label}
                </Typography>
              )}
            </Breadcrumbs>

            {/* Search bar */}
            <Box sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                maxWidth: 400,
                bgcolor: 'action.hover',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  bgcolor: 'background.paper',
                },
                transition: 'all 0.2s',
              }}>
                <Icon icon="solar:magnifer-linear" width={16} color="gray" />
                <InputBase
                  placeholder="Search..."
                  sx={{ fontSize: 13, flex: 1, color: 'text.primary' }}
                />
              </Box>
            </Box>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={handleOpenNotif}>
                <Badge badgeContent={unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                  <Icon icon="solar:bell-linear" width={20} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Android 12 theme toggle */}
            <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
              <Box
                onClick={toggleTheme}
                sx={{
                  position: 'relative',
                  width: 38,
                  height: 20,
                  borderRadius: 10,
                  bgcolor: mode === 'dark' ? '#f97316' : 'rgba(0,0,0,0.12)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  px: '3px',
                  flexShrink: 0,
                }}
              >
                {/* thumb */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: mode === 'dark' ? '#fff' : '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: mode === 'dark' ? 'translateX(18px)' : 'translateX(0px)',
                  }}
                >
                  <Icon
                    icon={mode === 'dark' ? 'solar:moon-bold' : 'solar:sun-bold'}
                    width={10}
                    color={mode === 'dark' ? '#f97316' : '#aaa'}
                  />
                </Box>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ my: 1.5, mx: 0.5 }} />

            {/* Live clock */}
            <Box>
              <Typography variant="body2" fontWeight={700} lineHeight={1} color="text.primary"
                sx={{ fontFamily: "'Noto Sans Sinhala', serif !important" }}>
                {timeStr}
              </Typography>
              <Typography variant="caption" lineHeight={1} color="text.secondary"
                sx={{ fontFamily: "'Noto Sans Sinhala', serif !important", display: 'block', mt: '2px' }}>
                {dateStr}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications popover */}
        <Popover
          open={!!notifAnchor}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 300, mt: 0.5 } } }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{MOCK_NOTIFICATIONS.length} total</Typography>
          </Box>
          <List disablePadding>
            {MOCK_NOTIFICATIONS.map((n, i) => (
              <ListItem
                key={n.id}
                divider={i < MOCK_NOTIFICATIONS.length - 1}
                sx={{ gap: 1.5, py: 1.2, alignItems: 'flex-start' }}
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: n.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={n.icon} width={16} color={n.color} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: 12.5, lineHeight: 1.4 }}>{n.text}</Typography>}
                  secondary={<Typography variant="caption" sx={{ color: 'text.disabled' }}>{n.time}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Popover>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
