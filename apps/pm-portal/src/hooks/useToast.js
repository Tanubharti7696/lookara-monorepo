import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg) => {
    setToast({ msg, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, show };
}
