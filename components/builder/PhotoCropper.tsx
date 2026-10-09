"use client";

import { useEffect, useRef, useState } from "react";

/** Crop foto persegi sederhana: zoom + geser, hasil JPEG 300x300. */
export default function PhotoCropper({ file, onDone, onCancel }: { file: File; onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    const S = c.width;
    const base = S / Math.min(img.width, img.height);
    const w = img.width * base * zoom;
    const h = img.height * base * zoom;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(img, (S - w) / 2 + (x * (w - S)) / 2, (S - h) / 2 + (y * (h - S)) / 2, w, h);
  }, [img, zoom, x, y]);

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <canvas ref={canvas} width={300} height={300} className="mx-auto h-48 w-48 rounded-full border border-line" aria-label="Pratinjau crop foto" />
      <label className="label" htmlFor="crop-zoom">
        Zoom
      </label>
      <input id="crop-zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full" />
      <label className="label" htmlFor="crop-x">
        Geser horizontal
      </label>
      <input id="crop-x" type="range" min={-1} max={1} step={0.05} value={x} onChange={(e) => setX(+e.target.value)} className="w-full" />
      <label className="label" htmlFor="crop-y">
        Geser vertikal
      </label>
      <input id="crop-y" type="range" min={-1} max={1} step={0.05} value={y} onChange={(e) => setY(+e.target.value)} className="w-full" />
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary" onClick={() => canvas.current && onDone(canvas.current.toDataURL("image/jpeg", 0.85))}>
          Gunakan foto
        </button>
        <button type="button" className="btn btn-soft" onClick={onCancel}>
          Batal
        </button>
      </div>
    </div>
  );
}
