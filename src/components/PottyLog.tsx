"use client";

import { useState } from "react";
import { PottyEntry } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatDate, todayISO, nowTime } from "@/lib/helpers";
import InlineEdit, { InlinePillSelect } from "./InlineEdit";

const TYPES = ["pee", "poop", "both"];
const LOCATIONS = ["inside", "outside", "pad"];
const CONSISTENCIES = ["normal", "soft", "diarrhea", "hard", "blood"];

export default function PottyLog({
  entries,
  onUpdate,
}: {
  entries: PottyEntry[];
  onUpdate: (e: PottyEntry[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<PottyEntry>>({
    date: todayISO(), time: nowTime(), type: "poop", location: "inside", consistency: "normal", notes: "",
  });

  const sorted = [...entries].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });

  const handleAdd = () => {
    onUpdate([...entries, { ...form, id: generateId() } as PottyEntry]);
    setForm({ date: todayISO(), time: nowTime(), type: "poop", location: "inside", consistency: "normal", notes: "" });
    setShowForm(false);
  };

  const updateField = (id: string, field: keyof PottyEntry, value: string) => {
    onUpdate(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const typeEmoji: Record<string, string> = { pee: "💧", poop: "💩", both: "💧💩" };
  const locationColor: Record<string, string> = { inside: "bg-red-100 text-red-700", outside: "bg-green-100 text-green-700", pad: "bg-blue-100 text-blue-700" };
  const consistencyColor: Record<string, string> = { normal: "bg-green-100 text-green-700", soft: "bg-yellow-100 text-yellow-700", diarrhea: "bg-red-100 text-red-700", hard: "bg-orange-100 text-orange-700", blood: "bg-red-200 text-red-800" };

  const today = todayISO();
  const todayEntries = entries.filter((e) => e.date === today);
  const outsideCount = todayEntries.filter((e) => e.location === "outside").length;
  const insideCount = todayEntries.filter((e) => e.location === "inside" || e.location === "pad").length;

  const grouped: Record<string, PottyEntry[]> = {};
  sorted.forEach((e) => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">💩 Potty Tracker</h3>
        <button onClick={() => setShowForm(!showForm)} className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200">+ Log</button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 rounded-xl">
          <div className="text-lg font-bold text-green-700">{outsideCount}</div>
          <div className="text-xs text-green-600">Outside</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-xl">
          <div className="text-lg font-bold text-red-700">{insideCount}</div>
          <div className="text-xs text-red-600">Inside/Pad</div>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-xl">
          <div className="text-lg font-bold text-amber-700">{todayEntries.length}</div>
          <div className="text-xs text-amber-600">Total Today</div>
        </div>
      </div>

      {showForm && (
        <div className="no-print mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-amber-700">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-amber-700">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (<button key={t} onClick={() => setForm({ ...form, type: t as PottyEntry["type"] })} className={`px-3 py-1.5 rounded-full text-sm ${form.type === t ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100"}`}>{typeEmoji[t]} {t}</button>))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {LOCATIONS.map((l) => (<button key={l} onClick={() => setForm({ ...form, location: l as PottyEntry["location"] })} className={`px-3 py-1.5 rounded-full text-sm ${form.location === l ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100"}`}>{l}</button>))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONSISTENCIES.map((c) => (<button key={c} onClick={() => setForm({ ...form, consistency: c as PottyEntry["consistency"] })} className={`px-3 py-1.5 rounded-full text-sm ${form.consistency === c ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100"}`}>{c}</button>))}
          </div>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([date, logs]) => (
        <div key={date} className="mb-4">
          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">{formatDate(date)}</h4>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-amber-50 rounded-xl space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg">{typeEmoji[log.type]}</span>
                  <InlineEdit value={log.time} onSave={(v) => updateField(log.id, "time", v)} type="time" displayClassName="text-sm text-amber-600 font-mono" />
                  <InlinePillSelect value={log.type} options={TYPES} onSave={(v) => updateField(log.id, "type", v)} />
                  <InlinePillSelect value={log.location} options={LOCATIONS} onSave={(v) => updateField(log.id, "location", v)} colorMap={locationColor} />
                  <InlinePillSelect value={log.consistency} options={CONSISTENCIES} onSave={(v) => updateField(log.id, "consistency", v)} colorMap={consistencyColor} />
                  <button onClick={() => onUpdate(entries.filter((e) => e.id !== log.id))} className="no-print text-red-400 hover:text-red-600 text-xs ml-auto">🗑️</button>
                </div>
                <InlineEdit value={log.notes} onSave={(v) => updateField(log.id, "notes", v)} displayClassName="text-xs text-gray-500" placeholder="Add notes..." emptyLabel="" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
