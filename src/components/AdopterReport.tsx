"use client";

import { PuppyData } from "@/lib/types";
import { formatDate, getAge, categoryIcon, severityColor } from "@/lib/helpers";

export default function AdopterReport({ data }: { data: PuppyData }) {
  const { profile, weights, healthLogs, feedings, milestones, dailyNotes, vetChecklists } = data;
  const latestWeight = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

  return (
    <div className="space-y-6">
      <div className="no-print card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">💌 Adopter Report</h3>
        <p className="text-sm text-amber-600 mb-4">
          A complete report to send home with {profile.name}&apos;s new family. Print this page or save as PDF.
        </p>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-pink-600 shadow-lg"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-lg" id="adopter-report">
        <div className="text-center pb-6 border-b-2 border-amber-200 mb-6">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-amber-900">{profile.name}&apos;s Passport</h1>
          <p className="text-amber-600 mt-1">Complete Health &amp; Growth History</p>
          <p className="text-sm text-gray-500 mt-2">Prepared with love on {formatDate(new Date().toISOString().split("T")[0])}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">🐶 About {profile.name}</h2>
            <table className="text-sm w-full">
              <tbody>
                {[
                  ["Name", profile.name],
                  ["Breed", profile.breed],
                  ["Color/Markings", profile.color],
                  ["Sex", profile.sex],
                  profile.dateOfBirth ? ["Date of Birth", formatDate(profile.dateOfBirth)] : null,
                  profile.dateOfBirth ? ["Age", getAge(profile.dateOfBirth)] : null,
                  profile.dateRescued ? ["Date Rescued", formatDate(profile.dateRescued)] : null,
                  ["Microchip ID", profile.microchipId || "Not yet microchipped"],
                  ["Current Weight", latestWeight ? `${latestWeight.weightLbs} lbs (${formatDate(latestWeight.date)})` : "TBD"],
                ].filter((r): r is [string, string] => r !== null).map(([label, value]) => (
                  <tr key={label} className="border-b border-amber-50">
                    <td className="py-1.5 text-amber-600 font-medium w-40">{label}</td>
                    <td className="py-1.5 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            {profile.personality && (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-pink-50 rounded-xl mb-4">
                <h3 className="font-bold text-amber-800 mb-1">Personality</h3>
                <p className="text-sm text-gray-700">{profile.personality}</p>
              </div>
            )}
            {profile.rescueStory && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-1">Rescue Story</h3>
                <p className="text-sm text-gray-700">{profile.rescueStory}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">🩺 Complete Health History</h2>
          <div className="space-y-2">
            {[...healthLogs].sort((a, b) => a.date.localeCompare(b.date)).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-lg">{categoryIcon(log.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{log.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor(log.severity)}`}>{log.severity}</span>
                    {log.resolved && <span className="text-xs text-green-600 font-medium">✓ Resolved</span>}
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                  {log.details && <p className="text-sm text-gray-600 mt-1">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {weights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-3">⚖️ Weight History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-amber-600 border-b border-amber-200">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[...weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => (
                  <tr key={w.id} className="border-b border-gray-100">
                    <td className="py-1.5">{formatDate(w.date)}</td>
                    <td className="py-1.5 font-medium">{w.weightLbs} lbs</td>
                    <td className="py-1.5 text-gray-600">{w.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vetChecklists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-3">✅ Vaccination &amp; Vet Schedule</h2>
            {vetChecklists.sort((a, b) => a.weekAge - b.weekAge).map((cl) => (
              <div key={cl.id} className="mb-4">
                <h4 className="font-bold text-sm text-amber-700 mb-2">Week {cl.weekAge}</h4>
                <div className="space-y-1">
                  {cl.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={item.done ? "text-green-500" : "text-gray-300"}>{item.done ? "✅" : "⬜"}</span>
                      <span className={item.done ? "text-gray-900" : "text-gray-500"}>{item.label}</span>
                      {item.dueDate && !item.done && <span className="text-xs text-gray-400">Due: {formatDate(item.dueDate)}</span>}
                      {item.notes && <span className="text-xs text-gray-500 italic">— {item.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {milestones.filter((m) => m.achieved).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-3">🌟 Milestones Achieved</h2>
            <div className="grid grid-cols-2 gap-2">
              {milestones.filter((m) => m.achieved).sort((a, b) => a.date.localeCompare(b.date)).map((m) => (
                <div key={m.id} className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="font-medium text-sm text-gray-900">🌟 {m.title}</div>
                  <div className="text-xs text-gray-500">{formatDate(m.date)}</div>
                  {m.description && <div className="text-xs text-gray-600 mt-1">{m.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {feedings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-3">🍽️ Feeding Summary</h2>
            <p className="text-sm text-gray-700">
              Total meals logged: {feedings.length}<br />
              Most common food: {(() => {
                const counts: Record<string, number> = {};
                feedings.forEach((f) => { counts[f.foodType] = (counts[f.foodType] || 0) + 1; });
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                return sorted[0]?.[0] || "N/A";
              })()}
            </p>
          </div>
        )}

        {dailyNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-900 mb-3">📔 Recent Journal Entries</h2>
            {[...dailyNotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((note) => (
              <div key={note.id} className="p-3 bg-purple-50 rounded-xl mb-2 border border-purple-100">
                <span className="text-sm font-medium">{formatDate(note.date)}</span>
                <span className="text-sm text-gray-600 ml-2">— {note.notes || `Mood: ${note.mood}, Energy: ${note.energyLevel}/5`}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-6 border-t-2 border-amber-200">
          <div className="text-4xl mb-2">🐾💛🐾</div>
          <p className="text-amber-800 font-medium">Welcome home, {profile.name}! You are so loved.</p>
          <p className="text-sm text-gray-500 mt-2">
            This report was generated by Rescue Pup Passport — every moment matters.
          </p>
          {profile.adopterName && (
            <p className="text-sm text-amber-700 mt-2 font-medium">Prepared for: {profile.adopterName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
