"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "textarea" | "date" | "number" | "time" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  step?: string;
  multiline?: boolean;
  rows?: number;
  emptyLabel?: string;
}

export default function InlineEdit({
  value,
  onSave,
  type = "text",
  options,
  placeholder = "Click to edit...",
  className = "",
  displayClassName = "",
  inputClassName = "",
  step,
  multiline = false,
  rows = 2,
  emptyLabel,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const commit = useCallback((newValue: string) => {
    if (newValue !== value) {
      onSave(newValue);
    }
    setEditing(false);
  }, [value, onSave]);

  const handleBlur = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    commit(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit(draft);
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  };

  const handleChange = (newValue: string) => {
    setDraft(newValue);
    // Auto-save with debounce for textareas
    if (multiline || type === "textarea") {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        if (newValue !== value) onSave(newValue);
      }, 800);
    }
    // Instant save for selects and dates
    if (type === "select" || type === "date") {
      onSave(newValue);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-amber-50 rounded px-1 -mx-1 transition-colors border border-transparent hover:border-amber-200 inline-block min-w-[2rem] ${displayClassName} ${className}`}
        title="Click to edit"
      >
        {value || <span className="text-gray-400 italic">{emptyLabel || placeholder}</span>}
      </span>
    );
  }

  const baseInput = "px-2 py-1 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-sm";

  if (type === "select" && options) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement | null>}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={`${baseInput} ${inputClassName} ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  if (type === "textarea" || multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement | null>}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={`w-full ${baseInput} ${inputClassName} ${className}`}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement | null>}
      type={type}
      value={draft}
      step={step}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${baseInput} ${inputClassName} ${className}`}
    />
  );
}

// Inline toggle for booleans
export function InlineToggle({
  value,
  onSave,
  labelOn = "Yes",
  labelOff = "No",
  className = "",
}: {
  value: boolean;
  onSave: (value: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  className?: string;
}) {
  return (
    <button
      onClick={() => onSave(!value)}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        value ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${className}`}
    >
      {value ? labelOn : labelOff}
    </button>
  );
}

// Inline pill selector
export function InlinePillSelect({
  value,
  options,
  onSave,
  colorMap,
  className = "",
}: {
  value: string;
  options: string[];
  onSave: (value: string) => void;
  colorMap?: Record<string, string>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    const color = colorMap?.[value] || "bg-gray-100 text-gray-700";
    return (
      <button
        onClick={() => setOpen(true)}
        className={`px-2 py-0.5 rounded-full text-xs font-medium hover:ring-2 hover:ring-amber-300 transition-all ${color} ${className}`}
        title="Click to change"
      >
        {value}
      </button>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {options.map((opt) => {
        const color = colorMap?.[opt] || "bg-gray-100 text-gray-700";
        return (
          <button
            key={opt}
            onClick={() => { onSave(opt); setOpen(false); }}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
              opt === value ? color + " ring-2 ring-amber-400" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
