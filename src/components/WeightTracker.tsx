"use client";

import { useState } from "react";
import { WeightEntry } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { formatShortDate, todayISO } from "@/lib/helpers";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import InlineEdit from "./InlineEdit";

export default function WeightTracker({
  weights,
  compact,
  onUpdate,
}: {
  weights: WeightEntry[];
  compact?: boolean;
  onUpdate: (w: WeightEntry[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [weightLbs, setWeightLbs] = useState("");
  const [notes, setNotes] = useState("");

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((w) => ({
    date: formatShortDate(w.date),
    weight: w.weightLbs,
  }));

  const handleAdd = () => {
    const w = parseFloat(weightLbs);
    if (isNaN(w)) return;
    onUpdate([...weights, { id: generateId(), date, weightLbs: w, notes }]);
    setWeightLbs("");
    setNotes("");
    setShowForm(false);
  };

  const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1].weightLbs : null;
  const previousWeight = sorted.length > 1 ? sorted[sorted.length - 2].weightLbs : null;
  const gain = latestWeight && previousWeight ? latestWeight - previousWeight : null;

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">⚖️ Weight Tracker</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
        >
          + Weigh-in
        </button>
      </div>

      {showForm && (
        <div className="no-print mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-amber-700">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-amber-700">Weight (lbs)</label>
              <input type="number" step="0.1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="2.5" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
            </div>
          </div>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Weight summary */}
      {latestWeight !== null && (
        <div className="mb-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-amber-900">{latestWeight} lbs</div>
          {gain !== null && (
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${gain >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {gain >= 0 ? "+" : ""}{gain.toFixed(1)} lbs
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#92400e" />
              <YAxis tick={{ fontSize: 11 }} stroke="#92400e" unit=" lb" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length <= 1 && (
        <div className="h-32 flex items-center justify-center text-amber-400 text-sm">
          <p>Add at least 2 weigh-ins to see a growth chart 📈</p>
        </div>
      )}

      {/* Weight log table */}
      {!compact && sorted.length > 0 && (
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-amber-600 border-b border-amber-100">
                <th className="pb-2">Date</th>
                <th className="pb-2">Weight</th>
                <th className="pb-2">Notes</th>
                <th className="pb-2 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {[...sorted].reverse().map((w) => (
                <tr key={w.id} className="border-b border-amber-50">
                  <td className="py-2">
                    <InlineEdit value={w.date} onSave={(v) => onUpdate(weights.map((x) => x.id === w.id ? { ...x, date: v } : x))} type="date" displayClassName="text-gray-700" />
                  </td>
                  <td className="py-2">
                    <InlineEdit value={String(w.weightLbs)} onSave={(v) => onUpdate(weights.map((x) => x.id === w.id ? { ...x, weightLbs: parseFloat(v) || 0 } : x))} type="number" step="0.1" displayClassName="font-medium text-amber-900" inputClassName="w-20" />
                    <span className="text-amber-700 text-xs ml-1">lbs</span>
                  </td>
                  <td className="py-2">
                    <InlineEdit value={w.notes} onSave={(v) => onUpdate(weights.map((x) => x.id === w.id ? { ...x, notes: v } : x))} displayClassName="text-gray-600" placeholder="Add notes..." emptyLabel="" />
                  </td>
                  <td className="py-2 no-print">
                    <button onClick={() => onUpdate(weights.filter((x) => x.id !== w.id))} className="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
