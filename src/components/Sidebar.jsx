import { NavLink } from 'react-router-dom';
import {
  Drawer, Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon },
  { label: 'Slots',     to: '/slots',     Icon: ViewModuleIcon },
  { label: 'Analytics', to: '/analytics', Icon: BarChartIcon },
  { label: 'Logs',      to: '/logs',      Icon: ReceiptLongIcon },
  { label: 'Clients',   to: '/clients',   Icon: PeopleIcon },
  { label: 'Cards',     to: '/cards',     Icon: CreditCardIcon },
];

const activeSx = {
  borderRadius: 2,
  '&.active': {
    bgcolor: 'rgba(249,115,22,0.12)',
    color: 'primary.main',
    '& .MuiListItemIcon-root': { color: 'primary.main' },
  },
};

export default function Sidebar({ width }) {
  const { logout, user } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 34, height: 34, borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LocalParkingIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={800} color="primary" letterSpacing={-0.3}>
          ParkAdmin
        </Typography>
      </Box>

      <Divider />

      {/* Main nav */}
      <List sx={{ px: 1, pt: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map(({ label, to, Icon }) => (
          <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton component={NavLink} to={to} sx={activeSx}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Bottom: Settings + user info + logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={NavLink} to="/settings" sx={activeSx}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Sign out"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: 'error.main' }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User chip at bottom */}
      {user && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Signed in as
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.email ?? user.name ?? 'Admin'}
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
}
