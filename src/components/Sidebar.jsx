import { NavLink } from 'react-router-dom';
import {
  Drawer, Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider, Tooltip,
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext';

const nav = [
  { label: 'Dashboard',  to: '/dashboard',  Icon: DashboardIcon },
  { label: 'Slots',      to: '/slots',      Icon: ViewModuleIcon },
  { label: 'Analytics',  to: '/analytics',  Icon: BarChartIcon },
  { label: 'Logs',       to: '/logs',       Icon: ReceiptLongIcon },
  { label: 'Clients',    to: '/clients',    Icon: PeopleIcon },
  { label: 'Cards',      to: '/cards',      Icon: CreditCardIcon },
];

export default function Sidebar({ width }) {
  const { logout } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LocalParkingIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          ParkAdmin
        </Typography>
      </Box>

      <Divider />

      {/* Nav links */}
      <List sx={{ px: 1, pt: 1, flexGrow: 1 }}>
        {nav.map(({ label, to, Icon }) => (
          <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={to}
              sx={{
                borderRadius: 2,
                '&.active': {
                  bgcolor: 'rgba(249,115,22,0.12)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Settings + Logout */}
      <List sx={{ px: 1, pb: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={NavLink}
            to="/settings"
            sx={{
              borderRadius: 2,
              '&.active': {
                bgcolor: 'rgba(249,115,22,0.12)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <Tooltip title="Sign out" placement="right">
            <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
              <ListItemText
                primary="Sign out"
                primaryTypographyProps={{ fontSize: 14, color: 'error.main' }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
}
