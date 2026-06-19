import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';

function formatEntry(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SlotCard({ slot }) {
  const occupied = slot.status === 'occupied';

  return (
    <Card
      variant="outlined"
      sx={{
        borderWidth: 2,
        borderColor: occupied ? 'error.main' : 'success.main',
        bgcolor: occupied ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
        height: '100%',
        transition: 'border-color 0.3s, background-color 0.3s',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Slot label + status chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800} letterSpacing={-0.3}>
            {slot.label ?? `Slot ${slot.id}`}
          </Typography>
          <Chip
            label={occupied ? 'Occupied' : 'Free'}
            size="small"
            color={occupied ? 'error' : 'success'}
            sx={{ fontWeight: 700, fontSize: 11 }}
          />
        </Box>

        {/* Icon + details */}
        {occupied ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <DirectionsCarIcon fontSize="small" color="error" />
              <Typography variant="body2" fontWeight={700}>
                {slot.carNumber ?? '-'}
              </Typography>
            </Box>
            {slot.entryTime && (
              <Typography variant="caption" color="text.secondary">
                Entry: {formatEntry(slot.entryTime)}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'success.main' }}>
            <LocalParkingIcon fontSize="small" />
            <Typography variant="body2" color="success.main" fontWeight={600}>
              Available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function SlotGrid({ slots = [] }) {
  if (!slots.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No slot data available.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {slots.map((slot) => (
        <Grid key={slot.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <SlotCard slot={slot} />
        </Grid>
      ))}
    </Grid>
  );
}
