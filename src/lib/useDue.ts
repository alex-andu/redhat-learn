import { useEffect, useState } from 'react';
import { api } from './api';
import { useStore } from './store';

export function useDueCount() {
  const { statsVersion } = useStore();
  const [n, setN] = useState(0);
  useEffect(() => {
    api.srsCards().then((rows) => setN(rows.filter((r) => new Date(r.card.due) <= new Date()).length)).catch(() => {});
  }, [statsVersion]);
  return n;
}
