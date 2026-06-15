import {
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Typography, Divider,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

export default function ActivityFeed({ events = [] }) {
  if (!events.length) {
    return <Typography variant="body2" color="text.secondary">No recent activity.</Typography>;
  }

  return (
    <List disablePadding>
      {events.map((ev, i) => (
        <div key={ev.id ?? i}>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                <DirectionsCarIcon fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={ev.title}
              secondary={ev.time}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: 12 }}
            />
          </ListItem>
          {i < events.length - 1 && <Divider component="li" />}
        </div>
      ))}
    </List>
  );
}
