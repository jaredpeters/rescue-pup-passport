"use client";

import { VetChecklist } from "@/lib/types";
import { formatDate } from "@/lib/helpers";

export default function VetChecklists({
  checklists,
  onUpdate,
}: {
  checklists: VetChecklist[];
  onUpdate: (c: VetChecklist[]) => void;
}) {
  const toggleItem = (checklistId: string, itemIdx: number) => {
    onUpdate(
      checklists.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((item, i) =>
                i === itemIdx ? { ...item, done: !item.done } : item
              ),
            }
          : cl
      )
    );
  };

  const updateNote = (checklistId: string, itemIdx: number, notes: string) => {
    onUpdate(
      checklists.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((item, i) =>
                i === itemIdx ? { ...item, notes } : item
              ),
            }
          : cl
      )
    );
  };

  const sorted = [...checklists].sort((a, b) => a.weekAge - b.weekAge);

  return (
    <div className="space-y-6">
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">✅ Puppy Vet Schedule & Checklists</h3>
        <p className="text-sm text-amber-600 mb-4">
          Track every vet milestone. Check items off as you go — this will be included in the adopter report!
        </p>

        {/* Overall progress */}
        <div className="mb-6">
          {(() => {
            const total = checklists.reduce((sum, cl) => sum + cl.items.length, 0);
            const done = checklists.reduce((sum, cl) => sum + cl.items.filter((i) => i.done).length, 0);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-amber-700 font-medium">Overall Progress</span>
                  <span className="text-amber-900 font-bold">{done}/{total} ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {sorted.map((checklist) => {
        const done = checklist.items.filter((i) => i.done).length;
        const total = checklist.items.length;
        return (
          <div key={checklist.id} className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-amber-900">
                📋 Week {checklist.weekAge} Checklist
              </h4>
              <span className="text-xs font-medium text-amber-600">
                {done}/{total} complete
              </span>
            </div>

            <div className="space-y-3">
              {checklist.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    item.done
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-amber-100 hover:bg-amber-50"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(checklist.id, idx)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.done
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-amber-300 hover:border-amber-500"
                    }`}
                  >
                    {item.done && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${item.done ? "text-green-700 line-through" : "text-gray-900"}`}>
                      {item.label}
                    </span>
                    {item.dueDate && (
                      <span className="text-xs text-gray-500 ml-2">Due: {formatDate(item.dueDate)}</span>
                    )}
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateNote(checklist.id, idx, e.target.value)}
                      placeholder="Add notes..."
                      className="no-print w-full mt-1 px-2 py-1 text-xs border border-transparent hover:border-amber-200 focus:border-amber-300 rounded bg-transparent focus:bg-white"
                    />
                    {item.notes && <p className="print-only text-xs text-gray-500 mt-1">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
