'use client';

import { useState, useEffect, useCallback } from 'react';

// A custom hook to synchronize state with localStorage.
// The `isSingleton` flag ensures that updates from one component
// are reflected in others using the same key.
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isSingleton = true, // Set to true to sync across tabs
): [T, (value: T | ((val: T) => T)) => void] {
  
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
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
      try {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        if (typeof window !== 'undefined') {
          const stringifiedValue = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, stringifiedValue);
          // Dispatch a custom event to notify other components/tabs
          window.dispatchEvent(new CustomEvent('local-storage', { detail: { key, value: stringifiedValue } }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, value]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
         try {
            if (e.newValue) {
              setValue(JSON.parse(e.newValue));
            } else {
              setValue(initialValue);
            }
         } catch (error) {
            console.warn(`Error parsing localStorage key “${key}” from storage event:`, error);
         }
      }
    };
    
    const handleCustomEvent = (e: Event) => {
        const { key: eventKey, value: eventValue } = (e as CustomEvent).detail;
        if (eventKey === key) {
            try {
                setValue(JSON.parse(eventValue));
            } catch (error) {
                console.warn(`Error parsing localStorage key “${key}” from custom event:`, error);
            }
        }
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent);
    };
  }, [key, initialValue]);

  return [value, setLocalStorageValue];
}
