import { useCallback, useEffect, useRef } from 'react';

export const useOnClickOutside = (fn: any) => {
  const ref = useRef<any>(undefined!);

  const onClickOutside = useCallback((ev: MouseEvent) => {
    if (ref?.current?.contains(ev.target)) {
      return;
    }
    fn();
  }, [fn]);

  useEffect(() => {
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    }
  }, []);

  return {
    ref,
  };
}
