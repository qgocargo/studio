"use client"
import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if(saved) {
      try {
        const initial = JSON.parse(saved);
        return initial;
      } catch (e) {
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
