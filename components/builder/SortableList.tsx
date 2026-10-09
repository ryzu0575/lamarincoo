"use client";

import { useRef } from "react";

interface Props<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, index: number) => React.ReactNode;
  label: (item: T) => string;
}

/** Daftar yang dapat diurutkan: drag & drop (mouse) + tombol naik/turun (keyboard). */
export default function SortableList<T extends { id: string }>({ items, onChange, render, label }: Props<T>) {
  const from = useRef<number | null>(null);

  const move = (a: number, b: number) => {
    if (b < 0 || b >= items.length || a === b) return;
    const next = [...items];
    const [x] = next.splice(a, 1);
    next.splice(b, 0, x);
    onChange(next);
  };

  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li
          key={it.id}
          draggable
          onDragStart={() => (from.current = i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (from.current !== null) move(from.current, i);
            from.current = null;
          }}
          className="rounded-2xl border border-line bg-surface2 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="cursor-grab select-none text-sm font-bold" title="Seret untuk mengurutkan">
              ⠿ {label(it)}
            </span>
            <span className="flex gap-1">
              <button type="button" className="btn btn-soft !px-3 !py-1" aria-label={`Naikkan ${label(it)}`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                ↑
              </button>
              <button type="button" className="btn btn-soft !px-3 !py-1" aria-label={`Turunkan ${label(it)}`} disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                ↓
              </button>
            </span>
          </div>
          {render(it, i)}
        </li>
      ))}
    </ul>
  );
}
