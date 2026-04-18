"use client";

import { useState, useRef } from "react";
import { PuppyData } from "@/lib/types";
import { exportDataAsJson, importDataFromJson, importVetCsv } from "@/lib/storage";

export default function DataTools({
  data,
  onImport,
  onArchive,
  onDelete,
}: {
  data: PuppyData;
  onImport: (d: PuppyData) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}) {
  const [importStatus, setImportStatus] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const slug = data.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleExportJson = () => {
    const json = exportDataAsJson(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-passport-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const imported = importDataFromJson(text);
      if (imported) {
        onImport(imported);
        setImportStatus("Profile imported. Child records (health, weights, etc.) are held in the current view only — full bulk-restore will land in a future update.");
      } else {
        setImportStatus("Couldn't read that file. Please upload a file exported from this app.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { healthLogs, weights } = importVetCsv(text);
      const updated = {
        ...data,
        healthLogs: [...data.healthLogs, ...healthLogs],
        weights: [...data.weights, ...weights],
      };
      onImport(updated);
      setImportStatus(`Staged ${healthLogs.length} health records and ${weights.length} weight entries in this view. Add them individually to save to the database.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">📦 Backup &amp; Data Tools</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">Export this dog</h4>
            <p className="text-sm text-green-700 mb-3">Download {data.profile.name}&apos;s complete record as a JSON file.</p>
            <button onClick={handleExportJson} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
              Download JSON
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Import backup (preview)</h4>
            <p className="text-sm text-blue-700 mb-3">Load a previously exported file into this view for review.</p>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
              Import JSON File
            </button>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-2">Import vet records (CSV)</h4>
            <p className="text-sm text-purple-700 mb-3">
              Upload a CSV with columns: <code className="text-xs bg-purple-100 px-1 rounded">date, type, title, details, severity</code>
            </p>
            <p className="text-xs text-purple-600 mb-2">
              Types: vaccine, deworming, medication, symptom, vet_visit, weight<br />
              Severity: info, mild, moderate, urgent<br />
              For weight rows, put the weight in the title column.
            </p>
            <input ref={csvRef} type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
            <button onClick={() => csvRef.current?.click()} className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600">
              Import CSV
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">Sample CSV template</h4>
            <p className="text-sm text-amber-700 mb-3">Download a template to fill in vet records.</p>
            <button
              onClick={() => {
                const csv = `date,type,title,details,severity
2026-04-05,vaccine,DHPP #1,First round distemper/parvo combo,info
2026-04-05,deworming,Pyrantel,Deworming treatment,info
2026-04-06,symptom,Loose stool,Day after meds — resolved in 48h,mild
2026-04-05,weight,3.2,First weigh-in at vet,info`;
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "vet-template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
            >
              Download Template CSV
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 text-center font-medium">
            {importStatus}
          </div>
        )}
      </div>

      {(onArchive || onDelete) && (
        <div className="card-glow bg-white rounded-2xl p-5 border border-red-200">
          <h4 className="font-bold text-red-800 mb-2">Danger zone</h4>
          <p className="text-sm text-red-600 mb-3">
            Archive hides this dog from the main list (records stay in the database). Delete removes them permanently.
          </p>
          <div className="flex flex-wrap gap-2">
            {onArchive && (
              <button onClick={onArchive} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 border border-red-200">
                Archive {data.profile.name}
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 border border-red-300">
                Delete permanently
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
