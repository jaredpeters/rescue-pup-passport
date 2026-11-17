"use client";

import { useState } from "react";
import { Dog, DogStatus } from "@/lib/types";
import { formatDate } from "@/lib/helpers";

const statusOptions: { value: DogStatus; label: string }[] = [
  { value: "in_rehab", label: "In rehab" },
  { value: "ready_for_adoption", label: "Ready for adoption" },
  { value: "adopted", label: "Adopted" },
  { value: "returned", label: "Returned" },
  { value: "foster_only", label: "Foster only" },
];

export default function ProfileCard({
  profile,
  onUpdate,
}: {
  profile: Dog;
  onUpdate: (p: Dog) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Dog>(profile);

  const handleSave = () => {
    onUpdate(form);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Edit Profile</h3>
        <div className="space-y-3">
          {([
            ["name", "Name", "text"],
            ["breed", "Breed", "text"],
            ["color", "Color / Markings", "text"],
            ["sex", "Sex", "text"],
            ["dateOfBirth", "Date of Birth", "date"],
            ["dateRescued", "Date Rescued", "date"],
            ["microchipId", "Microchip ID", "text"],
            ["adoptionDate", "Adoption Date", "date"],
            ["adopterName", "Adopter Name", "text"],
            ["adopterContact", "Adopter Contact", "text"],
          ] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="text-xs font-medium text-amber-700">{label}</label>
              <input
                type={type}
                value={form[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-amber-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DogStatus })}
              className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-amber-700">Personality</label>
            <textarea
              value={form.personality}
              onChange={(e) => setForm({ ...form, personality: e.target.value })}
              rows={3}
              className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-amber-700">Rescue Story</label>
            <textarea
              value={form.rescueStory}
              onChange={(e) => setForm({ ...form, rescueStory: e.target.value })}
              rows={3}
              placeholder="How they came to you"
              className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Save</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = statusOptions.find((s) => s.value === profile.status)?.label ?? profile.status;

  return (
    <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">🐾 {profile.name}</h3>
          <p className="text-sm text-amber-600 mt-1">{profile.breed || "Breed TBD"}</p>
          <p className="text-xs text-amber-500 mt-1">{statusLabel}</p>
        </div>
        <button
          onClick={() => { setForm(profile); setEditing(true); }}
          className="text-xs text-amber-500 hover:text-amber-700 font-medium"
        >
          Edit
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {profile.color && (
          <div className="flex justify-between"><span className="text-amber-600">Color</span><span className="text-amber-900 font-medium">{profile.color}</span></div>
        )}
        {profile.sex && (
          <div className="flex justify-between"><span className="text-amber-600">Sex</span><span className="text-amber-900 font-medium">{profile.sex}</span></div>
        )}
        {profile.dateOfBirth && (
          <div className="flex justify-between"><span className="text-amber-600">Born</span><span className="text-amber-900 font-medium">{formatDate(profile.dateOfBirth)}</span></div>
        )}
        {profile.dateRescued && (
          <div className="flex justify-between"><span className="text-amber-600">Rescued</span><span className="text-amber-900 font-medium">{formatDate(profile.dateRescued)}</span></div>
        )}
        {profile.microchipId && (
          <div className="flex justify-between"><span className="text-amber-600">Microchip</span><span className="text-amber-900 font-medium font-mono text-xs">{profile.microchipId}</span></div>
        )}
        {profile.personality && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl">
            <p className="text-xs font-medium text-amber-700 mb-1">Personality</p>
            <p className="text-sm text-amber-900">{profile.personality}</p>
          </div>
        )}
        {profile.rescueStory && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs font-medium text-blue-700 mb-1">Rescue story</p>
            <p className="text-sm text-blue-900">{profile.rescueStory}</p>
          </div>
        )}
        {profile.adopterName && (
          <div className="mt-3 p-3 bg-pink-50 rounded-xl">
            <p className="text-xs font-medium text-pink-700 mb-1">Going Home To</p>
            <p className="text-sm text-pink-900 font-medium">{profile.adopterName}</p>
            {profile.adoptionDate && <p className="text-xs text-pink-600 mt-1">{formatDate(profile.adoptionDate)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
