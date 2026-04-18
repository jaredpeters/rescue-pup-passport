"use client";

import { PuppyData } from "@/lib/types";
import { getAgeWeeks } from "@/lib/helpers";

export default function QuickStats({ data }: { data: PuppyData }) {
  const ageWeeks = getAgeWeeks(data.profile.dateOfBirth);
  const latestWeight = data.weights.length > 0
    ? data.weights.sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;
  const unresolvedHealth = data.healthLogs.filter((h) => !h.resolved);
  const urgentItems = unresolvedHealth.filter((h) => h.severity === "urgent");
  const totalMilestones = data.milestones.filter((m) => m.achieved).length;
  const todayFeedings = data.feedings.filter(
    (f) => f.date === new Date().toISOString().split("T")[0]
  ).length;
  const todayPotty = data.pottyLogs.filter(
    (f) => f.date === new Date().toISOString().split("T")[0]
  ).length;
  const latestNote = data.dailyNotes.sort((a, b) => b.date.localeCompare(a.date))[0];

  const stats = [
    {
      label: "Age",
      value: `${ageWeeks} weeks`,
      icon: "📅",
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Weight",
      value: latestWeight ? `${latestWeight.weightLbs} lbs` : "No data",
      icon: "⚖️",
      color: "bg-green-50 border-green-200",
    },
    {
      label: "Active Alerts",
      value: urgentItems.length > 0 ? `${urgentItems.length} urgent` : unresolvedHealth.length > 0 ? `${unresolvedHealth.length} open` : "All clear",
      icon: urgentItems.length > 0 ? "🚨" : "✅",
      color: urgentItems.length > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200",
    },
    {
      label: "Today's Meals",
      value: `${todayFeedings}`,
      icon: "🍽️",
      color: "bg-orange-50 border-orange-200",
    },
    {
      label: "Today's Potty",
      value: `${todayPotty}`,
      icon: "💩",
      color: "bg-amber-50 border-amber-200",
    },
    {
      label: "Milestones",
      value: `${totalMilestones} achieved`,
      icon: "⭐",
      color: "bg-yellow-50 border-yellow-200",
    },
  ];

  return (
    <div>
      {/* Urgent banner */}
      {urgentItems.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
          <h4 className="font-bold text-red-800 flex items-center gap-2">
            🚨 Urgent Health Alerts
          </h4>
          <div className="mt-2 space-y-1">
            {urgentItems.map((item) => (
              <p key={item.id} className="text-sm text-red-700">
                • {item.title} — {item.details.slice(0, 100)}...
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`card-glow rounded-2xl p-4 border ${stat.color}`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Latest mood */}
      {latestNote && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
          <p className="text-sm text-purple-800">
            <span className="font-medium">Latest check-in:</span>{" "}
            Mood: {latestNote.mood} · Energy: {"🔋".repeat(latestNote.energyLevel)}
            {latestNote.notes && ` · "${latestNote.notes.slice(0, 80)}..."`}
          </p>
        </div>
      )}
    </div>
  );
}
