import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Typography, CircularProgress, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TablePagination, IconButton, Tooltip, InputAdornment, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Chip, Grid, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/axios';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];
const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'SUV', 'Truck', 'Other'];

const STATUS_COLOR = { active: 'success', inactive: 'default', suspended: 'error' };

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nic: '',
  address: '',
  vehicleNumber: '',
  vehicleType: 'Car',
  vehicleMake: '',
  vehicleModel: '',
  vehicleColor: '',
  status: 'active',
  notes: '',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function ClientModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
    setError('');
  }, [initial, open]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/api/clients/${initial.id}`, form);
        onSaved(data, 'edit');
      } else {
        const { data } = await api.post('/api/clients', form);
        onSaved(data, 'add');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'Edit Client' : 'Add New Client'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="overline" color="text.secondary">Personal Info</Typography>
          <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
            <Grid item xs={6}>
              <TextField label="First Name" value={form.firstName} onChange={set('firstName')} required fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} required fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" value={form.phone} onChange={set('phone')} required fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="NIC" value={form.nic} onChange={set('nic')} fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select label="Status" value={form.status} onChange={set('status')} fullWidth size="small"
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" value={form.address} onChange={set('address')} fullWidth size="small" multiline rows={2} />
            </Grid>
          </Grid>

          <Typography variant="overline" color="text.secondary">Vehicle Info</Typography>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField label="Vehicle Number" value={form.vehicleNumber} onChange={set('vehicleNumber')} required fullWidth size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select label="Vehicle Type" value={form.vehicleType} onChange={set('vehicleType')} fullWidth size="small"
              >
                {VEHICLE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField label="Make" value={form.vehicleMake} onChange={set('vehicleMake')} fullWidth size="small" placeholder="e.g. Toyota" />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Model" value={form.vehicleModel} onChange={set('vehicleModel')} fullWidth size="small" placeholder="e.g. Corolla" />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Color" value={form.vehicleColor} onChange={set('vehicleColor')} fullWidth size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" value={form.notes} onChange={set('notes')} fullWidth size="small" multiline rows={2} placeholder="Optional notes…" />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Client'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get('/api/clients')
      .then(({ data }) => setClients(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.firstName, c.lastName, c.email, c.phone, c.nic, c.vehicleNumber]
        .some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [clients, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(client) {
    setEditTarget(client);
    setModalOpen(true);
  }

  function handleSaved(data, mode) {
    setClients((prev) =>
      mode === 'edit'
        ? prev.map((c) => (c.id === data.id ? data : c))
        : [data, ...prev]
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Clients</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} of {clients.length} clients
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Client
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search name, email, NIC, vehicle number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {search && (
          <Tooltip title="Clear">
            <IconButton size="small" onClick={() => { setSearch(''); setPage(0); }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Table */}
      <Card variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover', whiteSpace: 'nowrap' } }}>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>NIC</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <PersonIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography variant="body2">No clients found.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((c, i) => (
                  <TableRow key={c.id ?? i} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {page * rowsPerPage + i + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.email ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.phone ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{c.nic ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{c.vehicleNumber ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{c.vehicleType ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status ?? 'active'}
                        color={STATUS_COLOR[c.status] ?? 'default'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        {fmt(c.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(c)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Card>

      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        initial={editTarget}
      />
    </Box>
  );
}
