"use client";

import { useState } from "react";
import { DailyNote } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatDate, todayISO, moodEmoji } from "@/lib/helpers";
import InlineEdit, { InlinePillSelect } from "./InlineEdit";

const MOODS: DailyNote["mood"][] = ["happy", "playful", "sleepy", "fussy", "sick", "calm"];

export default function DailyNotes({
  notes,
  onUpdate,
}: {
  notes: DailyNote[];
  onUpdate: (n: DailyNote[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<DailyNote>>({
    date: todayISO(), mood: "happy", energyLevel: 3, sleepHours: 0, notes: "",
  });

  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    onUpdate([...notes, { ...form, id: generateId() } as DailyNote]);
    setForm({ date: todayISO(), mood: "happy", energyLevel: 3, sleepHours: 0, notes: "" });
    setShowForm(false);
  };

  const updateField = (id: string, field: keyof DailyNote, value: unknown) => {
    onUpdate(notes.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const moodColors: Record<string, string> = {
    happy: "bg-green-100 text-green-700",
    playful: "bg-blue-100 text-blue-700",
    sleepy: "bg-purple-100 text-purple-700",
    fussy: "bg-orange-100 text-orange-700",
    sick: "bg-red-100 text-red-700",
    calm: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">📔 Daily Journal</h3>
        <button onClick={() => setShowForm(!showForm)} className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200">+ Entry</button>
      </div>

      {showForm && (
        <div className="no-print mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button key={m} onClick={() => setForm({ ...form, mood: m })} className={`px-3 py-1.5 rounded-full text-sm ${form.mood === m ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100"}`}>
                {moodEmoji(m)} {m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <button key={level} onClick={() => setForm({ ...form, energyLevel: level })} className={`w-10 h-10 rounded-full text-sm font-bold ${(form.energyLevel ?? 3) >= level ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-400"}`}>
                {level}
              </button>
            ))}
          </div>
          <input type="number" step="0.5" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: parseFloat(e.target.value) || 0 })} placeholder="Sleep hours" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="How was today?" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium">Add Entry</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((note) => (
          <div key={note.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{moodEmoji(note.mood)}</span>
                <InlinePillSelect
                  value={note.mood}
                  options={MOODS}
                  onSave={(v) => updateField(note.id, "mood", v)}
                  colorMap={moodColors}
                />
                <InlineEdit
                  value={note.date}
                  onSave={(v) => updateField(note.id, "date", v)}
                  type="date"
                  displayClassName="text-xs text-gray-500"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                <span className="no-print">Energy:</span>
                <div className="flex gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateField(note.id, "energyLevel", level)}
                      className={`w-5 h-5 rounded-full text-xs ${note.energyLevel >= level ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-400"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <InlineEdit
                  value={String(note.sleepHours)}
                  onSave={(v) => updateField(note.id, "sleepHours", parseFloat(v) || 0)}
                  type="number"
                  step="0.5"
                  displayClassName="text-xs"
                  inputClassName="w-16"
                />
                <span>h💤</span>
                <button onClick={() => onUpdate(notes.filter((n) => n.id !== note.id))} className="no-print text-red-400 hover:text-red-600">🗑️</button>
              </div>
            </div>
            <InlineEdit
              value={note.notes}
              onSave={(v) => updateField(note.id, "notes", v)}
              multiline
              rows={3}
              displayClassName="text-sm text-gray-700 leading-relaxed"
              placeholder="Write about today..."
              emptyLabel="Click to add notes..."
            />
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 text-amber-400">
          <p className="text-3xl mb-2">📔</p>
          <p className="text-sm">Start journaling daily to capture the journey!</p>
        </div>
      )}
    </div>
  );
}
