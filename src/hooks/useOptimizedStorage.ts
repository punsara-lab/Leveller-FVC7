import { useState, useEffect, useCallback } from 'react';

// Optimized storage hook to prevent excessive localStorage operations
export const useOptimizedStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const [pendingSave, setPendingSave] = useState(false);

  // Debounced save to localStorage
  useEffect(() => {
    if (pendingSave) {
      const timer = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
        setPendingSave(false);
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }
  }, [key, value, pendingSave]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const updated = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      setPendingSave(true);
      return updated;
    });
  }, []);

  return [value, updateValue] as const;
};