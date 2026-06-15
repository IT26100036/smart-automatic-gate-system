import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

function TrendBadge({ trend }) {
  if (trend == null) return null;

  const positive = trend > 0;
  const neutral = trend === 0;

  const Icon = neutral ? TrendingFlatIcon : positive ? TrendingUpIcon : TrendingDownIcon;
  const color = neutral ? 'text.secondary' : positive ? 'success.main' : 'error.main';
  const label = neutral ? '0%' : `${positive ? '+' : ''}${trend}%`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.5 }}>
      <Icon sx={{ fontSize: 15, color }} />
      <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function StatCard({ label, value, trend, icon }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 2.5,
          '&:last-child': { pb: 2.5 },
        }}
      >
        {/* Left: label, value, trend */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={800} letterSpacing={-0.5} lineHeight={1.2}>
            {value}
          </Typography>
          <TrendBadge trend={trend} />
        </Box>

        {/* Right: orange icon badge */}
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'rgba(249,115,22,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
