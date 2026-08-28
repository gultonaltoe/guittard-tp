"use client";

import { useEffect, useId, useState } from "react";
import type { Partner, SiteSettings } from "@/lib/types";
import PartnerForm, { type PartnerFormValues } from "./PartnerForm";
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
import { GripVertical, Pencil, Trash2, ExternalLink } from "lucide-react";

const emptyForm: PartnerFormValues = {
  name: "",
  logo: "",
  website_url: "",
  description: "",
  status: "masque",
};

export default function PartnersManager() {
  const [items, setItems] = useState<Partner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingSection, setTogglingSection] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toggleId = useId();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [resItems, resSettings] = await Promise.all([
        fetch("/api/admin/partners"),
        fetch("/api/admin/site-settings"),
      ]);
      if (!resItems.ok || !resSettings.ok) throw new Error("Erreur de chargement.");
      const [bodyItems, bodySettings] = await Promise.all([resItems.json(), resSettings.json()]);
      setItems(bodyItems.partners ?? []);
      setSettings(bodySettings.settings ?? null);
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

  async function toggleSection() {
    if (!settings) return;
    const next = !settings.partners_section_enabled;
    setSettings({ ...settings, partners_section_enabled: next });
    setTogglingSection(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partners_section_enabled: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSettings({ ...settings, partners_section_enabled: !next });
      setError("Échec de la mise à jour de l'affichage.");
    } finally {
      setTogglingSection(false);
    }
  }

  async function handleCreate(values: PartnerFormValues) {
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la création.");
    setCreating(false);
    await load();
  }

  async function handleUpdate(id: string, values: PartnerFormValues) {
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la modification.");
    setEditingId(null);
    await load();
  }

  async function remove(item: Partner) {
    const confirmed = confirm(`Supprimer définitivement "${item.name}" ?\n\nCette action est définitive.`);
    if (!confirmed) return;
    const res = await fetch(`/api/admin/partners/${item.id}`, { method: "DELETE" });
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
    const res = await fetch("/api/admin/partners/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((i) => i.id) }),
    });
    if (!res.ok) {
      setError("Échec du réordonnancement.");
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label htmlFor={toggleId} className="font-semibold text-[#464746]">
              Afficher la section sur le site
            </label>
          </div>
          <button
            id={toggleId}
            role="switch"
            type="button"
            aria-checked={settings?.partners_section_enabled ?? false}
            onClick={toggleSection}
            disabled={loading || togglingSection || !settings}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              settings?.partners_section_enabled ? "bg-[#464746]" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                settings?.partners_section_enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {!settings?.partners_section_enabled && (
          <p className="mt-2 text-sm text-neutral-500">
            Section masquée sur le site public tant qu&apos;elle n&apos;est pas activée ci-dessus.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
          }}
          className="rounded bg-[#464746] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a]"
        >
          {creating ? "Fermer" : "+ Ajouter un partenaire"}
        </button>
      </div>

      {creating && (
        <div className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
          <h2 className="font-semibold text-[#464746]">Nouveau partenaire</h2>
          <div className="mt-4">
            <PartnerForm
              initial={emptyForm}
              submitLabel="Créer le partenaire"
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Partenaires ({items.length})</h2>
        </div>

        {loading ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucun partenaire pour l&apos;instant.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <PartnerRow
                    key={item.id}
                    item={item}
                    editing={editingId === item.id}
                    onEdit={() => {
                      setEditingId(item.id);
                      setCreating(false);
                    }}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={(values) => handleUpdate(item.id, values)}
                    onDelete={remove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function PartnerRow({
  item,
  editing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  item: Partner;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (values: PartnerFormValues) => Promise<void>;
  onDelete: (item: Partner) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (editing) {
    return (
      <li ref={setNodeRef} style={style} className="px-6 py-4">
        <PartnerForm
          initial={{
            name: item.name,
            logo: item.logo ?? "",
            website_url: item.website_url ?? "",
            description: item.description ?? "",
            status: item.status,
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
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-neutral-400 hover:text-neutral-600"
        aria-label="Réordonner"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white">
        {item.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.logo} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <div className="text-center text-[10px] text-neutral-400">Pas de logo</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#464746]">{item.name}</p>
        {item.website_url && (
          <a
            href={item.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#464746]"
          >
            {item.website_url}
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            item.status === "publie"
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          {item.status === "publie" ? "Publié" : "Masqué"}
        </span>
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
