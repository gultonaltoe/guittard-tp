"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const ALLOWED_TYPES = "image/jpeg,image/png,image/webp";

export default function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Échec de l'upload.");
        uploaded.push(body.url);
      }
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload.");
    } finally {
      setUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.indexOf(String(active.id));
    const newIndex = photos.indexOf(String(over.id));
    onChange(arrayMove(photos, oldIndex, newIndex));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(Array.from(e.dataTransfer.files));
        }}
        className={`mt-1 flex flex-col items-center justify-center rounded border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
          dragOver ? "border-[#e9cc1b] bg-[#fdf8e3]" : "border-neutral-300"
        }`}
      >
        <Upload size={20} className="text-neutral-400" />
        <p className="mt-2 text-neutral-600">Glissez des photos ici ou</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746] disabled:opacity-50"
        >
          Choisir des fichiers
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES}
          multiple
          hidden
          onChange={(e) => {
            uploadFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        {uploading && <p className="mt-2 text-xs text-neutral-500">Envoi en cours...</p>}
      </div>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}

      {photos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos} strategy={horizontalListSortingStrategy}>
            <div className="mt-3 flex flex-wrap gap-3">
              {photos.map((url) => (
                <PhotoThumb
                  key={url}
                  url={url}
                  onRemove={() => onChange(photos.filter((p) => p !== url))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function PhotoThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative h-20 w-28 shrink-0 cursor-grab overflow-hidden rounded border border-neutral-200"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
        aria-label="Supprimer cette photo"
      >
        <X size={14} />
      </button>
    </div>
  );
}
