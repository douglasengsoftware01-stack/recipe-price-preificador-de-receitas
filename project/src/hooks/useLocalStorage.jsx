import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
        
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    
    }
    
    catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

{/*import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);

      if (!item) return initialValue;

      // Proteção contra JSON inválido ou corrompido
      try {
        return JSON.parse(item);
      } catch {
        console.warn(`Valor corrompido no localStorage. Removendo chave: ${key}`);
        localStorage.removeItem(key);
        return initialValue;
      }

    } catch (error) {
      console.error(`Erro ao acessar localStorage (key: "${key}")`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar localStorage (key: "${key}")`, error);
    }
  };

  return [storedValue, setValue];
}
*/}