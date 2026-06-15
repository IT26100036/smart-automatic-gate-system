import {
  List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Typography, Divider, Box,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventItem({ log, showDivider }) {
  const isEntry = log.type === 'entry';

  return (
    <>
      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
        <ListItemAvatar sx={{ minWidth: 44 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: isEntry ? 'rgba(249,115,22,0.12)' : 'rgba(34,197,94,0.12)',
            }}
          >
            {isEntry
              ? <LoginIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              : <LogoutIcon sx={{ fontSize: 18, color: 'success.main' }} />
            }
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700}>
                {log.carNumber ?? '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(log.time)}
              </Typography>
            </Box>
          }
          secondary={
            <Typography variant="caption" color={isEntry ? 'primary.main' : 'success.main'} fontWeight={600}>
              {isEntry ? `Entry · Slot ${log.slot ?? '—'}` : `Exit · Slot ${log.slot ?? '—'}`}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </ListItem>
      {showDivider && <Divider component="li" />}
    </>
  );
}

export default function ActivityFeed({ logs = [] }) {
  if (!logs.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent activity.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {logs.map((log, i) => (
        <EventItem key={log.id ?? i} log={log} showDivider={i < logs.length - 1} />
      ))}
    </List>
  );
}
