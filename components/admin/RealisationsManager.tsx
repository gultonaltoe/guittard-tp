"use client";

import { useEffect, useState } from "react";
import type { Realisation, Categorie } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import RealisationForm, { type RealisationFormValues } from "./RealisationForm";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

const EMPTY_FORM: RealisationFormValues = {
  titre: "",
  description: "",
  categorie: "terrassement" as Categorie,
  publie: true,
  photos: [],
};

export default function RealisationsManager() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string>("toutes");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/realisations");
      if (!res.ok) throw new Error("Erreur de chargement.");
      const body = await res.json();
      setItems(body.realisations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, intentional
    load();
  }, []);

  async function handleCreate(values: RealisationFormValues) {
    const res = await fetch("/api/admin/realisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, position: items.length }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la création.");
    setCreating(false);
    await load();
  }

  async function handleUpdate(id: string, values: RealisationFormValues) {
    const res = await fetch(`/api/admin/realisations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la modification.");
    setEditingId(null);
    await load();
  }

  async function togglePublie(item: Realisation) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, publie: !i.publie } : i))
    );
    const res = await fetch(`/api/admin/realisations/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !item.publie }),
    });
    if (!res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, publie: item.publie } : i))
      );
      setError("Échec de la mise à jour du statut.");
    }
  }

  async function remove(item: Realisation) {
    const confirmed = confirm(
      `Supprimer définitivement "${item.titre}" ?\n\nCette action est définitive.`
    );
    if (!confirmed) return;
    const res = await fetch(`/api/admin/realisations/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Échec de la suppression.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    const res = await fetch("/api/admin/realisations/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((i) => i.id) }),
    });
    if (!res.ok) {
      setError("Échec du réordonnancement.");
      await load();
    }
  }

  const categoriesPresentes = CATEGORIES.filter((c) =>
    items.some((i) => i.categorie === c.value)
  );
  const visibles = filtre === "toutes" ? items : items.filter((i) => i.categorie === filtre);
  const canReorder = filtre === "toutes";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltre("toutes")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtre === "toutes"
                ? "bg-[#464746] text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
            }`}
          >
            Toutes
          </button>
          {categoriesPresentes.map((c) => (
            <button
              key={c.value}
              onClick={() => setFiltre(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtre === c.value
                  ? "bg-[#464746] text-white"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
          }}
          className="rounded bg-[#464746] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a]"
        >
          {creating ? "Fermer" : "+ Ajouter une réalisation"}
        </button>
      </div>

      {creating && (
        <div className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
          <h2 className="font-semibold text-[#464746]">Nouvelle réalisation</h2>
          <div className="mt-4">
            <RealisationForm
              initial={EMPTY_FORM}
              submitLabel="Créer la réalisation"
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Réalisations ({items.length})</h2>
          {!canReorder && (
            <p className="text-xs text-neutral-400">
              Réordonnancement disponible sans filtre de catégorie
            </p>
          )}
        </div>

        {loading ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
        ) : visibles.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucune réalisation pour l&apos;instant.</p>
        ) : canReorder ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibles.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-neutral-200">
                {visibles.map((item) => (
                  <RealisationRow
                    key={item.id}
                    item={item}
                    editing={editingId === item.id}
                    sortable
                    onEdit={() => {
                      setEditingId(item.id);
                      setCreating(false);
                    }}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={(values) => handleUpdate(item.id, values)}
                    onToggle={togglePublie}
                    onDelete={remove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {visibles.map((item) => (
              <RealisationRow
                key={item.id}
                item={item}
                editing={editingId === item.id}
                sortable={false}
                onEdit={() => {
                  setEditingId(item.id);
                  setCreating(false);
                }}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={(values) => handleUpdate(item.id, values)}
                onToggle={togglePublie}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RealisationRow({
  item,
  editing,
  sortable,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
  onDelete,
}: {
  item: Realisation;
  editing: boolean;
  sortable: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (values: RealisationFormValues) => Promise<void>;
  onToggle: (item: Realisation) => void;
  onDelete: (item: Realisation) => void;
}) {
  const sortableProps = useSortable({ id: item.id, disabled: !sortable });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortableProps;
  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  if (editing) {
    return (
      <li ref={setNodeRef} style={style} className="px-6 py-4">
        <RealisationForm
          initial={{
            titre: item.titre,
            description: item.description ?? "",
            categorie: item.categorie,
            publie: item.publie,
            photos: item.photos,
          }}
          submitLabel="Enregistrer"
          onSubmit={onSaveEdit}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-4 px-6 py-4">
      {sortable ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab text-neutral-400 hover:text-neutral-600"
          aria-label="Réordonner"
        >
          <GripVertical size={18} />
        </button>
      ) : (
        <span className="w-[18px] shrink-0" />
      )}

      <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-neutral-200">
        {item.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photos[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-neutral-400">
            Pas de photo
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#464746]">{item.titre}</p>
        <p className="text-xs text-neutral-500">
          {CATEGORIES.find((c) => c.value === item.categorie)?.label}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onToggle(item)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            item.publie
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          {item.publie ? "Publiée" : "Brouillon"}
        </button>
        <button
          onClick={onEdit}
          className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
          aria-label="Modifier"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="rounded border border-red-200 p-1.5 text-red-700 hover:bg-red-50"
          aria-label="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
