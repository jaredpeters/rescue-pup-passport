"use client";

import { useState } from "react";
import { FeedingEntry } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatDate, todayISO, nowTime } from "@/lib/helpers";
import InlineEdit, { InlinePillSelect } from "./InlineEdit";

const ATE_OPTIONS = ["all", "most", "some", "none"];

export default function FeedingLog({
  entries,
  onUpdate,
}: {
  entries: FeedingEntry[];
  onUpdate: (e: FeedingEntry[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FeedingEntry>>({
    date: todayISO(),
    time: nowTime(),
    foodType: "",
    amount: "",
    ate: "all",
    notes: "",
  });

  const sorted = [...entries].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });

  const handleAdd = () => {
    if (!form.foodType) return;
    onUpdate([...entries, { ...form, id: generateId() } as FeedingEntry]);
    setForm({ date: todayISO(), time: nowTime(), foodType: "", amount: "", ate: "all", notes: "" });
    setShowForm(false);
  };

  const updateField = (id: string, field: keyof FeedingEntry, value: string) => {
    onUpdate(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const ateColors: Record<string, string> = {
    all: "bg-green-100 text-green-700",
    most: "bg-blue-100 text-blue-700",
    some: "bg-yellow-100 text-yellow-700",
    none: "bg-red-100 text-red-700",
  };

  // Group by date
  const grouped: Record<string, FeedingEntry[]> = {};
  sorted.forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">🍽️ Feeding Log</h3>
        <button onClick={() => setShowForm(!showForm)} className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200">
          + Meal
        </button>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-amber-700">Food Type</label>
              <input type="text" value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })} placeholder="e.g., Puppy kibble (soaked)" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-amber-700">Amount</label>
              <input type="text" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g., 5mg" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-amber-700">How much did they eat?</label>
            <div className="flex gap-2 mt-1">
              {ATE_OPTIONS.map((a) => (
                <button key={a} onClick={() => setForm({ ...form, ate: a as FeedingEntry["ate"] })} className={`px-3 py-1 rounded-full text-xs font-medium ${form.ate === a ? ateColors[a] + " ring-2 ring-offset-1 ring-amber-400" : "bg-gray-100 text-gray-600"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Add Meal</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-8 text-amber-400">
          <p className="text-3xl mb-2">🍼</p>
          <p className="text-sm">No feedings logged yet. Track every meal!</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, meals]) => (
        <div key={date} className="mb-4">
          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">{formatDate(date)}</h4>
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="p-3 bg-amber-50 rounded-xl space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <InlineEdit value={meal.time} onSave={(v) => updateField(meal.id, "time", v)} type="time" displayClassName="text-sm text-amber-600 font-mono" />
                  <InlineEdit value={meal.foodType} onSave={(v) => updateField(meal.id, "foodType", v)} displayClassName="text-sm font-medium text-gray-900" placeholder="Food type..." />
                  <InlineEdit value={meal.amount} onSave={(v) => updateField(meal.id, "amount", v)} displayClassName="text-sm text-gray-500" placeholder="Amount..." emptyLabel="(amount)" />
                  <InlinePillSelect value={meal.ate} options={ATE_OPTIONS} onSave={(v) => updateField(meal.id, "ate", v)} colorMap={ateColors} />
                  <button onClick={() => onUpdate(entries.filter((e) => e.id !== meal.id))} className="no-print text-red-400 hover:text-red-600 text-xs ml-auto">🗑️</button>
                </div>
                <InlineEdit value={meal.notes} onSave={(v) => updateField(meal.id, "notes", v)} displayClassName="text-xs text-gray-500" placeholder="Add notes..." emptyLabel="" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
