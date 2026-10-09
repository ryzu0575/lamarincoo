"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export const KEYS = {
  cv: "lamarin:cv",
  reviews: "lamarin:reviews",
  letter: "lamarin:letter",
  letterForm: "lamarin:letterForm",
  importCv: "lamarin:importCv",
  theme: "lamarin:theme",
} as const;

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; val: unknown }>();

function read<T>(key: string, initial: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return initial;
  }
  const c = cache.get(key);
  if (c && c.raw === raw) return c.val as T;
  let val: T = initial;
  if (raw !== null) {
    try {
      val = JSON.parse(raw) as T;
    } catch {
      val = initial;
    }
  }
  cache.set(key, { raw, val });
  return val;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function writeStore<T>(key: string, value: T) {
  try {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    cache.set(key, { raw, val: value });
  } catch {
    // kuota penuh / mode privat: abaikan
  }
  listeners.forEach((l) => l());
}

export function removeStore(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
  cache.delete(key);
  listeners.forEach((l) => l());
}

export function clearAllData() {
  Object.values(KEYS).forEach((k) => {
    if (k !== KEYS.theme) removeStore(k);
  });
}

export function useLocalStorage<T>(key: string, initial: T) {
  const init = useRef(initial);
  const value = useSyncExternalStore(
    subscribe,
    () => read<T>(key, init.current),
    () => init.current,
  );
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = read<T>(key, init.current);
      writeStore(key, typeof v === "function" ? (v as (p: T) => T)(prev) : v);
    },
    [key],
  );
  return [value, set] as const;
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export interface ReviewRecord {
  id: string;
  date: string;
  label: string;
  score: number;
  subScores: Record<string, number>;
}
