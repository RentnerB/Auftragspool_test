import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        
        // If initialValue is an object, merge it with parsedItem to ensure all properties exist
        if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
          const mergedValue = { ...initialValue };
          
          // Only assign values from parsedItem if they exist and are not undefined
          Object.keys(initialValue as object).forEach(key => {
            if (parsedItem[key] !== undefined) {
              (mergedValue as any)[key] = parsedItem[key];
            }
          });
          
          return mergedValue;
        }
        
        return parsedItem;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}