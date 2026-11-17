"use client";

import { useState } from "react";
import { Milestone } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatDate, todayISO, getAgeWeeks } from "@/lib/helpers";
import InlineEdit, { InlinePillSelect } from "./InlineEdit";

const SUGGESTED_MILESTONES = [
  { week: 6, title: "Eyes fully open", category: "development" as const },
  { week: 6, title: "Walking confidently", category: "development" as const },
  { week: 6, title: "First solid food", category: "first" as const },
  { week: 7, title: "Playing with toys", category: "development" as const },
  { week: 7, title: "Responding to sounds", category: "development" as const },
  { week: 8, title: "Socialized with humans", category: "social" as const },
  { week: 8, title: "First bath", category: "first" as const },
  { week: 8, title: "Weaning complete", category: "development" as const },
  { week: 9, title: "Knows name", category: "training" as const },
  { week: 10, title: "Sit command", category: "training" as const },
  { week: 10, title: "Leash introduced", category: "training" as const },
  { week: 10, title: "First car ride", category: "first" as const },
  { week: 12, title: "Fully vaccinated (series)", category: "health" as const },
  { week: 12, title: "House training progress", category: "training" as const },
  { week: 12, title: "Socialized with other dogs", category: "social" as const },
];

const CATEGORIES: Milestone["category"][] = ["first", "development", "social", "training", "health"];

export default function MilestoneTracker({
  milestones,
  dob,
  onUpdate,
}: {
  milestones: Milestone[];
  dob: string;
  onUpdate: (m: Milestone[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "first" as Milestone["category"], date: todayISO() });
  const ageWeeks = getAgeWeeks(dob);

  const categoryColors: Record<string, string> = {
    development: "bg-blue-100 text-blue-700",
    social: "bg-purple-100 text-purple-700",
    training: "bg-green-100 text-green-700",
    health: "bg-red-100 text-red-700",
    first: "bg-pink-100 text-pink-700",
  };

  const handleAdd = () => {
    if (!form.title) return;
    onUpdate([...milestones, { id: generateId(), ...form, achieved: true }]);
    setForm({ title: "", description: "", category: "first", date: todayISO() });
    setShowForm(false);
  };

  const updateField = (id: string, field: keyof Milestone, value: unknown) => {
    onUpdate(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addSuggested = (s: typeof SUGGESTED_MILESTONES[0]) => {
    onUpdate([...milestones, { id: generateId(), date: todayISO(), category: s.category, title: s.title, description: "", achieved: true }]);
  };

  const achieved = milestones.filter((m) => m.achieved).sort((a, b) => a.date.localeCompare(b.date));
  const existingTitles = new Set(milestones.map((m) => m.title));
  const suggestions = SUGGESTED_MILESTONES.filter((s) => s.week <= ageWeeks + 2 && !existingTitles.has(s.title));

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">⭐ Milestones</h3>
        <button onClick={() => setShowForm(!showForm)} className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200">+ Add</button>
      </div>

      {showForm && (
        <div className="no-print mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Milestone["category"] })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Milestone title" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell the story..." rows={2} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="no-print mb-4">
          <p className="text-xs font-medium text-amber-600 mb-2">Coming up for week {ageWeeks}-{ageWeeks + 2}:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s.title} onClick={() => addSuggested(s)} className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 hover:bg-amber-100">
                + {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {achieved.map((m) => (
          <div key={m.id} className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="text-xl mt-0.5">🌟</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <InlineEdit value={m.title} onSave={(v) => updateField(m.id, "title", v)} displayClassName="font-medium text-sm text-gray-900" />
                  <InlinePillSelect value={m.category} options={CATEGORIES} onSave={(v) => updateField(m.id, "category", v)} colorMap={categoryColors} />
                </div>
                <InlineEdit value={m.date} onSave={(v) => updateField(m.id, "date", v)} type="date" displayClassName="text-xs text-gray-500" />
                <InlineEdit value={m.description} onSave={(v) => updateField(m.id, "description", v)} multiline rows={2} displayClassName="text-sm text-gray-600" placeholder="Tell the story..." emptyLabel="Click to add description..." />
              </div>
              <button onClick={() => onUpdate(milestones.filter((x) => x.id !== m.id))} className="no-print text-red-400 hover:text-red-600 text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {achieved.length === 0 && (
        <div className="text-center py-8 text-amber-400">
          <p className="text-3xl mb-2">🌟</p>
          <p className="text-sm">Track every special first and achievement!</p>
        </div>
      )}
    </div>
  );
}
