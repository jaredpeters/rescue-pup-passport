"use client";

import { useState } from "react";
import { Dog, DogStatus } from "@/lib/types";

const statusLabels: Record<DogStatus, { label: string; color: string }> = {
  in_rehab: { label: "In rehab", color: "bg-amber-100 text-amber-800" },
  ready_for_adoption: { label: "Ready", color: "bg-green-100 text-green-800" },
  adopted: { label: "Adopted", color: "bg-pink-100 text-pink-800" },
  returned: { label: "Returned", color: "bg-red-100 text-red-800" },
  foster_only: { label: "Foster", color: "bg-blue-100 text-blue-800" },
};

export default function DogSwitcher({
  dogs,
  selectedDogId,
  onSelect,
  onAddDog,
}: {
  dogs: Dog[];
  selectedDogId: string | null;
  onSelect: (id: string) => void;
  onAddDog: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const selected = dogs.find((d) => d.id === selectedDogId);

  const submit = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddDog(trimmed);
    setNewName("");
    setAdding(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-amber-200 hover:bg-white shadow-sm text-sm"
      >
        <span className="text-lg">🐾</span>
        <span className="font-medium text-amber-900">{selected?.name ?? "Pick a dog"}</span>
        <span className="text-amber-500 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setAdding(false); }} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-amber-200 shadow-lg z-50 overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              {dogs.length === 0 && (
                <div className="p-4 text-sm text-amber-700 text-center">
                  No dogs yet. Add your first!
                </div>
              )}
              {dogs.map((d) => {
                const meta = statusLabels[d.status] ?? statusLabels.in_rehab;
                return (
                  <button
                    key={d.id}
                    onClick={() => { onSelect(d.id); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-amber-50 flex items-center justify-between gap-2 ${d.id === selectedDogId ? "bg-amber-50" : ""}`}
                  >
                    <div>
                      <div className="text-sm font-medium text-amber-900">{d.name}</div>
                      <div className="text-xs text-amber-600">{d.breed || "Breed TBD"}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-amber-100 p-2">
              {adding ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="Dog's name"
                    className="flex-1 px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button onClick={submit} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Add</button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full text-left px-2 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg font-medium"
                >
                  + Add a new dog
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
