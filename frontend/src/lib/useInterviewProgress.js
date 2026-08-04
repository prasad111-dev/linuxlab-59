import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/**
 * Persists in-progress interview drills to the backend so the user can
 * resume where they left off after re-login.
 * mode: 'flashcard' | 'quest' | 'typing'
 */
export function useInterviewProgress(mode) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    let active = true;
    api(`/interview/progress/${mode}`)
      .then((p) => {
        if (active) {
          setData(p?.data || null);
          loadedRef.current = true;
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setData(null);
          loadedRef.current = true;
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [mode]);

  const save = useCallback(
    (next) => {
      setData(next);
      api(`/interview/progress/${mode}`, { method: 'PUT', body: { data: next } }).catch(() => {});
    },
    [mode]
  );

  const clear = useCallback(() => {
    loadedRef.current = true;
    setData(null);
    api(`/interview/progress/${mode}`, { method: 'DELETE' }).catch(() => {});
  }, [mode]);

  return { data, loaded, save, clear };
}
