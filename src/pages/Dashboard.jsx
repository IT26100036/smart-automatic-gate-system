import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import SlotGrid from '../components/SlotGrid';
import ActivityFeed from '../components/ActivityFeed';
import useSlots from '../hooks/useSlots';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` LKR ${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { callback: (v) => `LKR ${v}` },
    },
  },
};

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, letterSpacing: -0.2 }}>
      {children}
    </Typography>
  );
}

function deriveStats(slots, logs) {
  const total = slots.length;
  const occupied = slots.filter((s) => s.status === 'occupied').length;
  const free = total - occupied;
  const todayRevenue = logs
    .filter((l) => {
      const d = new Date(l.time);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .reduce((sum, l) => sum + (l.fee ?? 0), 0);

  return { total, occupied, free, todayRevenue };
}

function buildChartData(logs) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const labels = days.map((d) =>
    d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  );

  const data = days.map((day) =>
    logs
      .filter((l) => {
        const d = new Date(l.time);
        return (
          d.getFullYear() === day.getFullYear() &&
          d.getMonth() === day.getMonth() &&
          d.getDate() === day.getDate()
        );
      })
      .reduce((sum, l) => sum + (l.fee ?? 0), 0)
  );

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: 'rgba(249,115,22,0.8)',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#f97316',
      },
    ],
  };
}

export default function Dashboard() {
  const { slots, loading: slotsLoading } = useSlots();
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/parking/logs')
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, []);

  const loading = slotsLoading || logsLoading;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const { total, occupied, free, todayRevenue } = deriveStats(slots, logs);
  const recentLogs = [...logs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
  const chartData = buildChartData(logs);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stat cards — 4 in a row from md up, 2 on small */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Total Slots" value={total} icon={<ViewModuleIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Occupied"
            value={occupied}
            trend={total ? Math.round((occupied / total) * 100) : 0}
            icon={<DirectionsCarIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Available" value={free} icon={<CheckCircleIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Today's Revenue"
            value={`LKR ${todayRevenue.toLocaleString()}`}
            icon={<AttachMoneyIcon />}
          />
        </Grid>
      </Grid>

      {/* Slot grid */}
      <Box>
        <SectionTitle>Parking Slots</SectionTitle>
        <SlotGrid slots={slots} />
      </Box>

      {/* Chart + Activity feed */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle>Revenue — Last 7 Days</SectionTitle>
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent sx={{ height: 280, pt: 3 }}>
              <Bar data={chartData} options={CHART_OPTIONS} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle>Recent Activity</SectionTitle>
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent sx={{ maxHeight: 320, overflowY: 'auto' }}>
              <ActivityFeed logs={recentLogs} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
