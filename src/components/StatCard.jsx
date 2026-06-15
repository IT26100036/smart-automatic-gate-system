import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon && (
          <Box sx={{ color, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
