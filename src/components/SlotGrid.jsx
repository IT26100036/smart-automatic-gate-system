import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

const statusColor = {
  available: 'success.main',
  occupied: 'error.main',
  reserved: 'warning.main',
};

export default function SlotGrid({ slots = [] }) {
  return (
    <Grid container spacing={2}>
      {slots.map((slot) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={slot.id}>
          <Card
            sx={{
              borderTop: 3,
              borderColor: statusColor[slot.status] ?? 'divider',
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>{slot.label}</Typography>
              <Typography variant="caption" color={statusColor[slot.status] ?? 'text.secondary'}>
                {slot.status}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
