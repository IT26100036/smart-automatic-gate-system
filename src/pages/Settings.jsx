import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField,
  Button, Alert, Divider, CircularProgress, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── helpers ── */
function StatusIndicator({ ok, label }) {
  if (ok === null) {
    return (
      <Chip
        icon={<HourglassEmptyIcon />}
        label={label ?? 'Checking…'}
        size="small"
        variant="outlined"
      />
    );
  }
  return (
    <Chip
      icon={ok ? <CheckCircleIcon /> : <ErrorIcon />}
      label={label ?? (ok ? 'Online' : 'Offline')}
      color={ok ? 'success' : 'error'}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Box
        sx={{
          width: 38, height: 38, borderRadius: 2,
          bgcolor: 'rgba(249,115,22,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'primary.main', flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Box>
  );
}

/* ── Account form ── */
function AccountForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFeedback(null);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setFeedback({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setFeedback({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }

    const payload = { name: form.name, email: form.email };
    if (form.currentPassword) payload.currentPassword = form.currentPassword;
    if (form.newPassword) payload.newPassword = form.newPassword;

    setSaving(true);
    try {
      await api.put('/api/auth/profile', payload);
      setFeedback({ type: 'success', msg: 'Account updated successfully.' });
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Update failed. (Profile update endpoint not yet implemented on the backend.)' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <SectionHeader
          icon={<ManageAccountsIcon fontSize="small" />}
          title="Admin Account"
          subtitle="Update your name, email, or password"
        />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}

          <Typography variant="overline" color="text.secondary" sx={{ mb: -1 }}>Profile</Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={set('name')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={set('email')}
                fullWidth
                size="small"
                required
              />
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="overline" color="text.secondary" sx={{ mb: -1 }}>
            Change Password <Typography component="span" variant="caption" color="text.secondary">(leave blank to keep current)</Typography>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                type="password"
                value={form.currentPassword}
                onChange={set('currentPassword')}
                fullWidth
                size="small"
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                type="password"
                value={form.newPassword}
                onChange={set('newPassword')}
                fullWidth
                size="small"
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm New Password"
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                fullWidth
                size="small"
                autoComplete="new-password"
                error={Boolean(form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword)}
                helperText={
                  form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 140 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ── System status panel ── */
function SystemStatus() {
  const [health, setHealth] = useState(null);   // raw response
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);

  async function check() {
    setLoading(true);
    try {
      const { data } = await api.get('/health');
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
      setFetchedAt(new Date());
    }
  }

  useEffect(() => { check(); }, []);

  const apiOk = health !== null;
  const dbOk = health?.db === 'ok' || health?.database === 'connected' || health?.services?.db === 'ok' || null;
  const uptime = health?.uptime;

  function fmtUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <SectionHeader
          icon={<MonitorHeartIcon fontSize="small" />}
          title="System Status"
          subtitle="Real-time health of backend services"
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" size={28} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Status rows */}
            {[
              { label: 'API Server', ok: apiOk, detail: health?.version ? `v${health.version}` : null },
              { label: 'Database',   ok: dbOk,  detail: health?.db ?? health?.database ?? null },
              { label: 'Uptime',     ok: apiOk, detail: fmtUptime(uptime) },
            ].map(({ label, ok, detail }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  py: 1.5, px: 2, borderRadius: 2, bgcolor: 'action.hover',
                }}
              >
                <Typography variant="body2" fontWeight={600}>{label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {detail && (
                    <Typography variant="caption" color="text.secondary">{detail}</Typography>
                  )}
                  <StatusIndicator ok={loading ? null : ok} />
                </Box>
              </Box>
            ))}

            {/* Raw health data */}
            {health && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Raw response
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0, p: 1.5, borderRadius: 2,
                    bgcolor: 'action.selected',
                    fontSize: 12, fontFamily: 'monospace',
                    overflowX: 'auto',
                    color: 'text.primary',
                  }}
                >
                  {JSON.stringify(health, null, 2)}
                </Box>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              {fetchedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last checked at {fetchedAt.toLocaleTimeString()}
                </Typography>
              )}
              <Button size="small" onClick={check} disabled={loading}>
                Refresh
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Page ── */
export default function Settings() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>Settings</Typography>
        <Typography variant="caption" color="text.secondary">
          Manage your account and monitor system health
        </Typography>
      </Box>

      <AccountForm />
      <SystemStatus />
    </Box>
  );
}
