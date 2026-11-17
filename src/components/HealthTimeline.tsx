"use client";

import { useState } from "react";
import { HealthLog } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatDate, todayISO, severityColor, categoryIcon } from "@/lib/helpers";
import InlineEdit, { InlinePillSelect, InlineToggle } from "./InlineEdit";

const CATEGORIES: HealthLog["category"][] = ["vaccine", "deworming", "medication", "symptom", "vet_visit", "injury", "other"];
const SEVERITIES = ["info", "mild", "moderate", "urgent"];

export default function HealthTimeline({
  logs,
  compact,
  onUpdate,
}: {
  logs: HealthLog[];
  compact?: boolean;
  onUpdate: (logs: HealthLog[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<HealthLog>>({
    date: todayISO(),
    category: "symptom",
    title: "",
    details: "",
    severity: "info",
    resolved: false,
  });

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const displayed = compact ? sorted.slice(0, 5) : sorted;

  const handleAdd = () => {
    if (!form.title) return;
    onUpdate([...logs, { ...form, id: generateId(), resolved: false } as HealthLog]);
    setForm({ date: todayISO(), category: "symptom", title: "", details: "", severity: "info", resolved: false });
    setShowForm(false);
  };

  const updateField = (id: string, field: keyof HealthLog, value: unknown) => {
    onUpdate(logs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const deleteEntry = (id: string) => {
    onUpdate(logs.filter((l) => l.id !== id));
  };

  const severityColors: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    mild: "bg-yellow-100 text-yellow-800",
    moderate: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const categoryOptions: Record<string, string> = {
    vaccine: "bg-indigo-100 text-indigo-800",
    deworming: "bg-purple-100 text-purple-800",
    medication: "bg-teal-100 text-teal-800",
    symptom: "bg-rose-100 text-rose-800",
    vet_visit: "bg-blue-100 text-blue-800",
    injury: "bg-red-100 text-red-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">🩺 Health Timeline</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
        >
          + Log
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
              <label className="text-xs font-medium text-amber-700">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as HealthLog["category"] })} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Details..." rows={3} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2 flex-wrap">
            {SEVERITIES.map((s) => (
              <button key={s} onClick={() => setForm({ ...form, severity: s as HealthLog["severity"] })} className={`px-3 py-1 rounded-full text-xs font-medium ${form.severity === s ? severityColor(s) + " ring-2 ring-offset-1 ring-amber-400" : "bg-gray-100 text-gray-600"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Add Entry</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {displayed.map((log) => (
          <div
            key={log.id}
            className={`p-3 rounded-xl border ${
              log.resolved ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-amber-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-xl mt-0.5">{categoryIcon(log.category)}</div>
              <div className="flex-1 min-w-0 space-y-1">
                {/* Title — inline editable */}
                <div className="flex items-center gap-2 flex-wrap">
                  <InlineEdit
                    value={log.title}
                    onSave={(v) => updateField(log.id, "title", v)}
                    displayClassName={`font-medium text-sm ${log.resolved ? "line-through text-gray-500" : "text-gray-900"}`}
                    placeholder="Title..."
                  />
                  <InlinePillSelect
                    value={log.severity}
                    options={SEVERITIES}
                    onSave={(v) => updateField(log.id, "severity", v)}
                    colorMap={severityColors}
                  />
                  <InlinePillSelect
                    value={log.category}
                    options={CATEGORIES}
                    onSave={(v) => updateField(log.id, "category", v)}
                    colorMap={categoryOptions}
                  />
                </div>

                {/* Date — inline editable */}
                <InlineEdit
                  value={log.date}
                  onSave={(v) => updateField(log.id, "date", v)}
                  type="date"
                  displayClassName="text-xs text-gray-500"
                />

                {/* Details — inline editable textarea */}
                <InlineEdit
                  value={log.details}
                  onSave={(v) => updateField(log.id, "details", v)}
                  multiline
                  rows={2}
                  displayClassName="text-sm text-gray-700"
                  placeholder="Add details..."
                  emptyLabel="Click to add details..."
                />
              </div>

              {/* Actions */}
              <div className="no-print flex flex-col gap-1.5 shrink-0 items-end">
                <InlineToggle
                  value={log.resolved}
                  onSave={(v) => updateField(log.id, "resolved", v)}
                  labelOn="✅ Resolved"
                  labelOff="Open"
                />
                <button
                  onClick={() => deleteEntry(log.id)}
                  className="text-xs px-2 py-1 rounded-lg hover:bg-red-50 text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {compact && sorted.length > 5 && (
        <p className="mt-3 text-center text-xs text-amber-500 font-medium">
          + {sorted.length - 5} more entries — view Health tab for full timeline
        </p>
      )}
    </div>
  );
}
