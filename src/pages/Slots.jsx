import { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Tooltip, IconButton,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import useSlots from '../hooks/useSlots';
import SlotGrid from '../components/SlotGrid';
import useLiveTime from '../hooks/useLiveTime';

const RATE_PER_MIN = 0.5; // Rs. per minute

function calcCharge(entryTime, now) {
  if (!entryTime) return null;
  const mins = (now - new Date(entryTime)) / 60000;
  return Math.max(0, mins * RATE_PER_MIN);
}

function formatDuration(entryTime, now) {
  if (!entryTime) return '-';
  const totalSec = Math.floor((now - new Date(entryTime)) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Slots() {
  const { slots, loading, lastUpdated, updateSlot } = useSlots();
  const now = useLiveTime();
  const [clearing, setClearing] = useState(null);

  async function handleClear(slotNumber) {
    setClearing(slotNumber);
    try {
      await updateSlot(slotNumber, false);
    } finally {
      setClearing(null);
    }
  }

  const occupants = useMemo(
    () => slots.filter((s) => s.status === 'occupied'),
    [slots]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Parking Slots</Typography>
          <Typography variant="caption" color="text.secondary">
            {slots.filter((s) => s.status === 'occupied').length} occupied ·{' '}
            {slots.filter((s) => s.status !== 'occupied').length} free ·{' '}
            {slots.length} total
          </Typography>
        </Box>
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Typography>
        )}
      </Box>

      {/* Slot grid */}
      <SlotGrid slots={slots} />

      {/* Occupants table */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Current Occupants
        </Typography>

        {occupants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No occupied slots.</Typography>
        ) : (
          <Card variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell>Slot</TableCell>
                    <TableCell>Car Number</TableCell>
                    <TableCell>Entry Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell align="right">Est. Charge</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Override</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupants.map((slot) => {
                    const charge = calcCharge(slot.entryTime, now);
                    return (
                      <TableRow
                        key={slot.id}
                        hover
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {slot.label ?? `Slot ${slot.id}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {slot.carNumber ?? '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {slot.entryTime
                              ? new Date(slot.entryTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatDuration(slot.entryTime, now)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {charge != null ? `Rs. ${charge.toFixed(2)}` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="Occupied" color="error" size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Force clear slot">
                            <span>
                              <IconButton
                                size="small"
                                color="warning"
                                disabled={clearing === slot.slotNumber}
                                onClick={() => handleClear(slot.slotNumber)}
                              >
                                <LockOpenIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Rate footnote */}
            <CardContent sx={{ pt: 1, pb: '12px !important', borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Rate: Rs. {RATE_PER_MIN.toFixed(2)} / min · Charges update every second
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
