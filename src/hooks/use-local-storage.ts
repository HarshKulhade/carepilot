'use client';

import { useState, useEffect, useCallback } from 'react';

// A custom hook to synchronize state with localStorage.
// The `isSingleton` flag ensures that updates from one component
// are reflected in others using the same key.
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isSingleton = false,
): [T, (value: T | ((val: T) => T)) => void] {
  
  const [value, setValue] = useState<T>(() => {
    // On the server, return initial value
    if (typeof window === 'undefined') {
      return initialValue;
    }
    // On the client, try to read from localStorage
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setLocalStorageValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          if (isSingleton) {
            // Dispatch a storage event to notify other tabs/windows
            window.dispatchEvent(new StorageEvent('storage', { key }));
          }
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, isSingleton, value]
  );

  useEffect(() => {
    // This effect ensures that the state is updated when localStorage
    // changes in another tab or window.
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key || (isSingleton && e.key === key)) {
         try {
            const item = window.localStorage.getItem(key);
            if (item) {
              setValue(JSON.parse(item));
            } else {
              setValue(initialValue);
            }
         } catch (error) {
            console.warn(`Error parsing localStorage key “${key}”:`, error);
         }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus
    const handleFocus = () => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Only update if the value has actually changed
                if(JSON.stringify(parsed) !== JSON.stringify(value)) {
                    setValue(parsed);
                }
            }
        } catch (error) {
            console.warn(`Error re-validating localStorage key “${key}”:`, error);
        }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [key, isSingleton, initialValue, value]);

  return [value, setLocalStorageValue];
}
