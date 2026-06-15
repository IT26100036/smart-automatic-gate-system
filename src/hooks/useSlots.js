import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function useSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSlots = useCallback(async () => {
    try {
      const { data } = await api.get('/api/parking/slots');
      setSlots(data);
      setLastUpdated(new Date());
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    const id = setInterval(fetchSlots, 5000);
    return () => clearInterval(id);
  }, [fetchSlots]);

  return { slots, loading, lastUpdated };
}
