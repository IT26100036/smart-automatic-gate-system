import { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  ToggleButton, ToggleButtonGroup, CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../api/axios';
import StatCard from '../components/StatCard';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
);

const ORANGE = 'rgba(249,115,22,0.85)';
const ORANGE_LIGHT = 'rgba(249,115,22,0.15)';
const ORANGE_SOLID = '#f97316';
const BLUE = 'rgba(59,130,246,0.8)';
const DOUGHNUT_PALETTE = [
  '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6',
];

const baseBar = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true },
  },
};

const baseLine = {
  ...baseBar,
  elements: { point: { radius: 3, hoverRadius: 5 } },
};

const baseDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
  },
  cutout: '68%',
};

function Section({ title, children, height = 260 }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateLabel(date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function buildDayBuckets(days, logs, field) {
  return days.map((day) =>
    logs
      .filter((l) => {
        const d = new Date(l.time ?? l.entryTime);
        return (
          d.getFullYear() === day.getFullYear() &&
          d.getMonth() === day.getMonth() &&
          d.getDate() === day.getDate()
        );
      })
      .reduce((sum, l) => sum + (l[field] ?? 0), 0)
  );
}

function buildHourBuckets(logs) {
  const buckets = Array(24).fill(0);
  logs.forEach((l) => {
    const h = new Date(l.entryTime ?? l.time).getHours();
    if (!isNaN(h)) buckets[h]++;
  });
  return buckets;
}

function formatMins(mins) {
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
}

export default function Analytics() {
  const [range, setRange] = useState(7);
  const [logs, setLogs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/parking/logs'),
      api.get('/api/parking/slots'),
    ])
      .then(([logsRes, slotsRes]) => {
        setLogs(logsRes.data);
        setSlots(slotsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const cutoff = daysAgo(range);
    return logs.filter((l) => new Date(l.time ?? l.entryTime) >= cutoff);
  }, [logs, range]);

  const days = useMemo(
    () =>
      Array.from({ length: range }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (range - 1 - i));
        return d;
      }),
    [range]
  );

  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((s, l) => s + (l.fee ?? 0), 0);
    const totalEntries = filtered.filter((l) => l.type === 'entry').length || filtered.length;
    const durations = filtered
      .filter((l) => l.entryTime && l.exitTime)
      .map((l) => (new Date(l.exitTime) - new Date(l.entryTime)) / 60000);
    const avgDuration = durations.length
      ? durations.reduce((s, d) => s + d, 0) / durations.length
      : 0;
    const avgRevenue = totalEntries ? totalRevenue / totalEntries : 0;
    return { totalRevenue, totalEntries, avgDuration, avgRevenue };
  }, [filtered]);

  const dailyRevenue = useMemo(() => ({
    labels: days.map(dateLabel),
    datasets: [{
      data: buildDayBuckets(days, filtered, 'fee'),
      borderColor: ORANGE_SOLID,
      backgroundColor: ORANGE_LIGHT,
      fill: true,
      tension: 0.4,
    }],
  }), [days, filtered]);

  const dailyEntries = useMemo(() => ({
    labels: days.map(dateLabel),
    datasets: [{
      data: buildDayBuckets(days, filtered, 'fee').map((_, i) =>
        filtered.filter((l) => {
          const d = new Date(l.time ?? l.entryTime);
          return (
            d.getFullYear() === days[i].getFullYear() &&
            d.getMonth() === days[i].getMonth() &&
            d.getDate() === days[i].getDate()
          );
        }).length
      ),
      backgroundColor: BLUE,
      borderRadius: 5,
      borderSkipped: false,
    }],
  }), [days, filtered]);

  const peakHours = useMemo(() => {
    const buckets = buildHourBuckets(filtered);
    return {
      labels: Array.from({ length: 24 }, (_, h) =>
        `${String(h).padStart(2, '0')}:00`
      ),
      datasets: [{
        data: buckets,
        backgroundColor: buckets.map((v, _, arr) =>
          v === Math.max(...arr) ? ORANGE_SOLID : ORANGE
        ),
        borderRadius: 4,
        borderSkipped: false,
      }],
    };
  }, [filtered]);

  const slotUtil = useMemo(() => {
    const occupied = slots.filter((s) => s.status === 'occupied').length;
    const free = slots.length - occupied;
    return {
      labels: ['Occupied', 'Free'],
      datasets: [{
        data: [occupied, free],
        backgroundColor: ['#ef4444', '#22c55e'],
        borderWidth: 0,
      }],
    };
  }, [slots]);

  const carTypeSplit = useMemo(() => {
    const counts = {};
    filtered.forEach((l) => {
      const t = l.carType ?? 'Unknown';
      counts[t] = (counts[t] ?? 0) + 1;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [{
        data: labels.map((k) => counts[k]),
        backgroundColor: DOUGHNUT_PALETTE.slice(0, labels.length),
        borderWidth: 0,
      }],
    };
  }, [filtered]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header + range selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Analytics</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} events in the last {range} days
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={(_, v) => v && setRange(v)}
          size="small"
        >
          {[7, 14, 30].map((n) => (
            <ToggleButton key={n} value={n} sx={{ px: 2, fontWeight: 600 }}>
              {n}d
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Total Revenue"
            value={`Rs. ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<AttachMoneyIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Total Entries"
            value={stats.totalEntries.toLocaleString()}
            icon={<DirectionsCarIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Avg Duration"
            value={formatMins(stats.avgDuration)}
            icon={<TimerIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Avg Revenue / Visit"
            value={`Rs. ${stats.avgRevenue.toFixed(2)}`}
            icon={<TrendingUpIcon />}
          />
        </Grid>
      </Grid>

      {/* Line + Bar charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Daily Revenue (Rs.)">
            <Line
              data={dailyRevenue}
              options={{
                ...baseLine,
                scales: {
                  ...baseLine.scales,
                  y: { ...baseLine.scales.y, ticks: { callback: (v) => `Rs.${v}` } },
                },
              }}
            />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Daily Entries">
            <Bar data={dailyEntries} options={baseBar} />
          </Section>
        </Grid>
      </Grid>

      {/* Peak hours full width */}
      <Section title="Peak Hours (entries by hour)" height={220}>
        <Bar
          data={peakHours}
          options={{
            ...baseBar,
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
              y: { grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true },
            },
          }}
        />
      </Section>

      {/* Doughnuts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Section title="Slot Utilisation" height={220}>
            <Doughnut data={slotUtil} options={baseDoughnut} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Section title="Car Type Split" height={220}>
            <Doughnut data={carTypeSplit} options={baseDoughnut} />
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
}
