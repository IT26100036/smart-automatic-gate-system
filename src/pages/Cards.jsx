import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Typography, CircularProgress, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TablePagination, IconButton, Tooltip, InputAdornment, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddCardIcon from '@mui/icons-material/AddCard';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import api from '../api/axios';

const STATUS_COLOR = { active: 'success', inactive: 'default', suspended: 'error', blocked: 'error' };

function fmt(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── Top-up modal ── */
function TopUpModal({ open, onClose, card, onSaved }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setAmount(''); setError(''); }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) { setError('Enter a valid positive amount.'); return; }
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/api/cards/${card.cardId}/topup`, { amount: value });
      onSaved(data, card.cardId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Top-up failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Top Up Card</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {card && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">Card ID</Typography>
              <Typography variant="body1" fontWeight={700}>{card.cardId}</Typography>
              <Typography variant="caption" color="text.secondary">Current Balance</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                Rs. {Number(card.balance ?? 0).toFixed(2)}
              </Typography>
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Top-up Amount (Rs.)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            fullWidth
            size="small"
            inputProps={{ min: 1, step: 0.01 }}
          />
          {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
            <Typography variant="body2" color="text.secondary">
              New balance:{' '}
              <strong>Rs. {(Number(card?.balance ?? 0) + parseFloat(amount)).toFixed(2)}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Processing…' : 'Top Up'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Deactivate confirm dialog ── */
function DeactivateDialog({ open, onClose, card, onConfirmed }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setError('');
  }, [open]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await api.put(`/api/cards/${card.cardId}/deactivate`);
      onConfirmed(card.cardId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Deactivation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Card</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2">
          Are you sure you want to deactivate card{' '}
          <strong>{card?.cardId}</strong>?{' '}
          The card will no longer be usable at the gate.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Deactivating…' : 'Deactivate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Add Card modal ── */
function AddCardModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ cardId: '', clientId: '', balance: 0 });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ cardId: '', clientId: '', balance: 0 });
    setError('');
    api.get('/api/clients').then(({ data }) => setClients(data)).catch(() => {});
  }, [open]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.post('/api/cards', {
        cardId: form.cardId,
        clientId: form.clientId,
        balance: Number(form.balance),
      });
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create card.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Add New Card</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Card ID (RFID)"
            value={form.cardId}
            onChange={set('cardId')}
            required
            fullWidth
            size="small"
            placeholder="e.g. A1B2C3D4"
          />
          <TextField
            select
            label="Client"
            value={form.clientId}
            onChange={set('clientId')}
            required
            fullWidth
            size="small"
          >
            {clients.length === 0 ? (
              <MenuItem disabled>No clients available</MenuItem>
            ) : (
              clients.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name} - {c.carNumber}
                </MenuItem>
              ))
            )}
          </TextField>
          <TextField
            label="Initial Balance (Rs.)"
            type="number"
            value={form.balance}
            onChange={set('balance')}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Creating…' : 'Add Card'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Main page ── */
export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [addOpen, setAddOpen] = useState(false);
  const [topUpCard, setTopUpCard] = useState(null);
  const [deactivateCard, setDeactivateCard] = useState(null);

  useEffect(() => {
    api.get('/api/cards')
      .then(({ data }) => setCards(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) =>
      [c.cardId, c.clientId?.name, c.clientId?.email, c.clientId?.carNumber]
        .some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [cards, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function handleCardAdded(card) {
    setCards((prev) => [card, ...prev]);
  }

  function handleTopUpSaved({ balance }, cardId) {
    setCards((prev) => prev.map((c) => (c.cardId === cardId ? { ...c, balance } : c)));
  }

  function handleDeactivated(cardId) {
    setCards((prev) => prev.map((c) => (c.cardId === cardId ? { ...c, isActive: false } : c)));
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
          <Typography variant="h6" fontWeight={700}>Cards</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} of {cards.length} cards ·{' '}
            {cards.filter((c) => c.isActive).length} active
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Card
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search card ID, owner, vehicle number…"
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
                <TableCell>Card ID</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Vehicle Number</TableCell>
                <TableCell align="right">Balance (Rs.)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Issued</TableCell>
                <TableCell>Last Used</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <CreditCardIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography variant="body2">No cards found.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((card, i) => {
                  const isDeactivatable = card.isActive === true;
                  return (
                    <TableRow key={card.cardId ?? i} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {page * rowsPerPage + i + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                          {card.cardId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {card.clientId?.name ?? '-'}
                        </Typography>
                        {card.clientId?.email && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {card.clientId.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{card.clientId?.carNumber ?? '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={Number(card.balance) < 50 ? 'error.main' : 'primary.main'}
                        >
                          {Number(card.balance ?? 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.isActive ? 'active' : 'inactive'}
                          color={card.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {fmt(card.issuedAt ?? card.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {fmt(card.lastUsedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Top Up">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => setTopUpCard(card)}
                                disabled={!isDeactivatable}
                              >
                                <AddCardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={isDeactivatable ? 'Deactivate' : 'Already inactive'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeactivateCard(card)}
                                disabled={!isDeactivatable}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      <AddCardModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={handleCardAdded}
      />

      <TopUpModal
        open={Boolean(topUpCard)}
        onClose={() => setTopUpCard(null)}
        card={topUpCard}
        onSaved={handleTopUpSaved}
      />

      <DeactivateDialog
        open={Boolean(deactivateCard)}
        onClose={() => setDeactivateCard(null)}
        card={deactivateCard}
        onConfirmed={handleDeactivated}
      />
    </Box>
  );
}
