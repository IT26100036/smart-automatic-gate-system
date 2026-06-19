import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

function normalize(s) {
  return {
    id: s._id,
    label: `Slot ${s.slotNumber}`,
    slotNumber: s.slotNumber,
    status: s.isOccupied ? 'occupied' : 'free',
    isOccupied: s.isOccupied,
    cardId: s.cardId ?? null,
    carNumber: s.carNumber ?? null,
    entryTime: s.entryTime ?? null,
  };
}

export default function useSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSlots = useCallback(async () => {
    try {
      const { data } = await api.get('/api/parking/slots');
      setSlots(data.map(normalize));
      setLastUpdated(new Date());
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSlot = useCallback(async (slotNumber, isOccupied) => {
    const { data } = await api.put(`/api/parking/slots/${slotNumber}/status`, { isOccupied });
    setSlots((prev) => prev.map((s) => (s.slotNumber === slotNumber ? normalize(data) : s)));
  }, []);

  useEffect(() => {
    fetchSlots();
    const id = setInterval(fetchSlots, 5000);
    return () => clearInterval(id);
  }, [fetchSlots]);

  return { slots, loading, lastUpdated, updateSlot };
}
