import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Typography, CircularProgress, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TablePagination, Chip, IconButton, Tooltip, InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../api/axios';

const STATUS_OPTIONS = ['All', 'active', 'completed'];

const CHIP_COLOR = { active: 'warning', completed: 'success' };

function logType(log) {
  return log.exitTime ? 'completed' : 'active';
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDuration(entryTime, exitTime) {
  if (!entryTime || !exitTime) return '—';
  const mins = Math.round((new Date(exitTime) - new Date(entryTime)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function toCSV(rows) {
  const headers = ['ID', 'Card ID', 'Slot', 'Status', 'Entry Time', 'Exit Time', 'Duration', 'Amount Charged (Rs.)'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map((l) =>
      [
        l._id,
        l.cardId,
        l.slotNumber,
        logType(l),
        l.entryTime,
        l.exitTime,
        fmtDuration(l.entryTime, l.exitTime),
        l.amountCharged ?? 0,
      ]
        .map(escape)
        .join(',')
    ),
  ];
  return lines.join('\n');
}

function exportCSV(rows) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parking-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    api.get('/api/parking/logs')
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;

    return logs.filter((l) => {
      if (q && !String(l.cardId ?? '').toLowerCase().includes(q)) return false;
      if (status !== 'All' && logType(l) !== status) return false;
      const t = new Date(l.entryTime);
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [logs, search, status, dateFrom, dateTo]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function clearFilters() {
    setSearch('');
    setStatus('All');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  }

  const hasFilters = search || status !== 'All' || dateFrom || dateTo;

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
          <Typography variant="h6" fontWeight={700}>Activity Logs</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} of {logs.length} records
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search card ID or car number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          sx={{ minWidth: 130 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>{s === 'All' ? 'All Types' : s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          type="date"
          label="From"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          size="small"
          type="date"
          label="To"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        {hasFilters && (
          <Tooltip title="Clear filters">
            <IconButton size="small" onClick={clearFilters}>
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
                <TableCell>Client</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Entry Time</TableCell>
                <TableCell>Exit Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Amount (Rs.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No records match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((log, i) => {
                  const type = logType(log);
                  return (
                    <TableRow key={log._id ?? i} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {page * rowsPerPage + i + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {log.cardId ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.clientId?.name ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.slotNumber ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={type}
                          color={CHIP_COLOR[type] ?? 'default'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {fmt(log.entryTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {fmt(log.exitTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {fmtDuration(log.entryTime, log.exitTime)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {log.amountCharged != null ? Number(log.amountCharged).toFixed(2) : '—'}
                        </Typography>
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
    </Box>
  );
}
