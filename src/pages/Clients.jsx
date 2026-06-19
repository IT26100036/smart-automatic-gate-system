import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Typography, CircularProgress, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TablePagination, IconButton, Tooltip, InputAdornment, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Chip, Grid, Alert, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import api from '../api/axios';

const VEHICLE_TYPES = ['sedan', 'suv', 'van', 'truck', 'motorcycle', 'other'];

const STATUS_COLOR = { true: 'success', false: 'default' };

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  carNumber: '',
  carType: 'sedan',
  carModel: '',
  carColor: '',
};

function fmt(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function ClientModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?._id);
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
        const { data } = await api.put(`/api/clients/${initial._id}`, form);
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
            <Grid size={{ xs: 12 }}>
              <TextField label="Full Name" value={form.name} onChange={set('name')} required fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Phone" value={form.phone} onChange={set('phone')} required fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Address" value={form.address} onChange={set('address')} fullWidth size="small" multiline rows={2} />
            </Grid>
          </Grid>

          <Typography variant="overline" color="text.secondary">Vehicle Info</Typography>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Car Number" value={form.carNumber} onChange={set('carNumber')} required fullWidth size="small" placeholder="e.g. AB-1234" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                select label="Car Type" value={form.carType} onChange={set('carType')} fullWidth size="small"
              >
                {VEHICLE_TYPES.map((t) => (
                  <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Model" value={form.carModel} onChange={set('carModel')} required fullWidth size="small" placeholder="e.g. Corolla" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Color" value={form.carColor} onChange={set('carColor')} required fullWidth size="small" />
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

/* ── Delete confirmation dialog ── */
function DeleteDialog({ open, onClose, client, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) setError(''); }, [open]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await api.delete(`/api/clients/${client._id}`);
      onDeleted(client._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete Client</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2">
          Are you sure you want to delete <strong>{client?.name}</strong>? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Client detail modal ── */
function ClientDetailModal({ open, onClose, clientId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !clientId) return;
    setLoading(true);
    api.get(`/api/clients/${clientId}/card`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [open, clientId]);

  const card = detail?.card;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Client Details</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} color="primary" />
          </Box>
        ) : detail ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              {[
                { label: 'Name', value: detail.name },
                { label: 'Email', value: detail.email },
                { label: 'Phone', value: detail.phone },
                { label: 'Address', value: detail.address || '-' },
                { label: 'Car Number', value: detail.carNumber },
                { label: 'Car Type', value: detail.carType },
                { label: 'Car Model', value: detail.carModel },
                { label: 'Car Color', value: detail.carColor },
              ].map(({ label, value }) => (
                <Grid size={{ xs: 6 }} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value ?? '-'}</Typography>
                </Grid>
              ))}
            </Grid>
            <Divider />
            <Typography variant="subtitle2" fontWeight={700}>Linked Card</Typography>
            {card ? (
              <Grid container spacing={2}>
                {[
                  { label: 'Card ID', value: card.cardId },
                  { label: 'Balance', value: `Rs. ${Number(card.balance ?? 0).toFixed(2)}` },
                  { label: 'Status', value: card.isActive ? 'Active' : 'Inactive' },
                ].map(({ label, value }) => (
                  <Grid size={{ xs: 6 }} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No card linked to this client.</Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="error">Failed to load client details.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailId, setDetailId] = useState(null);

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
      [c.name, c.email, c.phone, c.carNumber, c.carModel]
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
        ? prev.map((c) => (c._id === data._id ? data : c))
        : [data, ...prev]
    );
  }

  function handleDeleted(id) {
    setClients((prev) => prev.filter((c) => c._id !== id));
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
                <TableCell>Car Number</TableCell>
                <TableCell>Model</TableCell>
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
                  <TableRow key={c._id ?? i} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {page * rowsPerPage + i + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {c.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.email ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.phone ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{c.carNumber ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{c.carModel ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{c.carType ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.isActive ? 'active' : 'inactive'}
                        color={c.isActive ? 'success' : 'default'}
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
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setDetailId(c._id)}>
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        client={deleteTarget}
        onDeleted={handleDeleted}
      />

      <ClientDetailModal
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        clientId={detailId}
      />
    </Box>
  );
}
