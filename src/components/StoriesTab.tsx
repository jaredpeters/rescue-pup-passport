"use client";

import { useState } from "react";
import { Story } from "@/lib/types";
import { formatDate } from "@/lib/helpers";
import InlineEdit from "./InlineEdit";

function formatRange(start: string, end: string): string {
  if (!start && !end) return "Undated";
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  if (start === end) return formatDate(start);
  return `${formatDate(start)} → ${formatDate(end)}`;
}

export default function StoriesTab({
  stories,
  unavailable,
  onAdd,
  onUpdate,
  onRemove,
}: {
  stories: Story[];
  unavailable: boolean;
  onAdd: (entry: Omit<Story, "id">) => void;
  onUpdate: (id: string, updates: Partial<Story>) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Story, "id">>({
    title: "",
    body: "",
    startDate: "",
    endDate: "",
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (unavailable) {
    return (
      <div className="card-glow bg-white rounded-2xl p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">📖 Stories</h3>
        <p className="text-sm text-amber-800 mb-4">
          This feature was added after your database was set up. To enable it, apply migration{" "}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded">0002_add_stories.sql</code>:
        </p>
        <ol className="text-sm text-amber-800 space-y-1.5 list-decimal list-inside mb-4">
          <li>Open your project folder and locate <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/0002_add_stories.sql</code>.</li>
          <li>Open your Supabase dashboard → SQL Editor → New query.</li>
          <li>Paste the file's contents into the editor and click <strong>Run</strong>.</li>
          <li>Reload this page.</li>
        </ol>
        <p className="text-xs text-amber-600">
          If you use Claude Code, you can also ask: <em>&ldquo;Walk me through applying migration 0002.&rdquo;</em>
        </p>
      </div>
    );
  }

  const sorted = [...stories].sort((a, b) => {
    const aKey = a.startDate || a.endDate || "";
    const bKey = b.startDate || b.endDate || "";
    return bKey.localeCompare(aKey);
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      body: form.body,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setForm({ title: "", body: "", startDate: "", endDate: "" });
    setShowForm(false);
  };

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-amber-900">📖 Stories</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="no-print px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
        >
          + Story
        </button>
      </div>
      <p className="text-xs text-amber-600 mb-4 no-print">
        Longer-form observations, turning points, and transitional periods. Fits what daily journal entries can&apos;t.
      </p>

      {showForm && (
        <div className="no-print mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title (e.g. 'Week one: the quiet room')"
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-amber-700 mb-1">Start date (optional)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-amber-700 mb-1">End date (optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={8}
            placeholder="Write the story…"
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm leading-relaxed"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!form.title.trim()}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium disabled:opacity-40"
            >
              Save story
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((story) => {
          const isExpanded = expanded[story.id] ?? false;
          const preview = story.body.length > 240 ? story.body.slice(0, 240).trimEnd() + "…" : story.body;
          return (
            <article
              key={story.id}
              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <InlineEdit
                    value={story.title}
                    onSave={(v) => onUpdate(story.id, { title: v })}
                    displayClassName="text-base font-bold text-amber-900 leading-tight"
                    placeholder="Untitled story"
                  />
                  <div className="text-xs text-amber-600 mt-1">{formatRange(story.startDate, story.endDate)}</div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete the story "${story.title || "Untitled"}"?`)) onRemove(story.id);
                  }}
                  className="no-print text-red-400 hover:text-red-600 shrink-0"
                  aria-label="Delete story"
                >
                  🗑️
                </button>
              </div>

              {isExpanded ? (
                <InlineEdit
                  value={story.body}
                  onSave={(v) => onUpdate(story.id, { body: v })}
                  multiline
                  rows={10}
                  displayClassName="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
                  placeholder="Write the story…"
                  emptyLabel="Click to add the story."
                />
              ) : (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {preview || <span className="italic text-gray-400">Empty story.</span>}
                </p>
              )}

              {story.body.length > 240 && (
                <button
                  onClick={() => setExpanded({ ...expanded, [story.id]: !isExpanded })}
                  className="no-print mt-2 text-xs text-amber-700 font-medium hover:text-amber-900"
                >
                  {isExpanded ? "Show less" : "Read more & edit"}
                </button>
              )}

              <div className="no-print mt-3 flex gap-3 text-xs">
                <button
                  onClick={() => setExpanded({ ...expanded, [story.id]: !isExpanded })}
                  className="text-amber-700 hover:text-amber-900"
                >
                  {isExpanded ? "Collapse" : "Edit"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {sorted.length === 0 && !showForm && (
        <div className="text-center py-10 text-amber-400">
          <p className="text-3xl mb-2">📖</p>
          <p className="text-sm">No stories yet. Capture the turning points, the hard weeks, the moments that don&apos;t fit a daily entry.</p>
        </div>
      )}
    </div>
  );
}
