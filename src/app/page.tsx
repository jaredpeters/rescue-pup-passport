"use client";

import { useState } from "react";
import { useDogStore } from "@/lib/useDogStore";
import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import QuickStats from "@/components/QuickStats";
import HealthTimeline from "@/components/HealthTimeline";
import WeightTracker from "@/components/WeightTracker";
import FeedingLog from "@/components/FeedingLog";
import PottyLog from "@/components/PottyLog";
import MilestoneTracker from "@/components/MilestoneTracker";
import DailyNotes from "@/components/DailyNotes";
import StoriesTab from "@/components/StoriesTab";
import VetChecklists from "@/components/VetChecklists";
import DataTools from "@/components/DataTools";
import AdopterReport from "@/components/AdopterReport";
import Resources from "@/components/Resources";
import SetupScreen from "@/components/SetupScreen";

export default function Home() {
  const store = useDogStore();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  if (!store.configured) {
    return <SetupScreen />;
  }

  if (store.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl paw-bounce">🐾</div>
          <p className="mt-4 text-amber-800 text-lg font-medium">Loading your rescues…</p>
        </div>
      </div>
    );
  }

  if (store.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg bg-white rounded-2xl p-8 border border-red-200 shadow-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Couldn&apos;t connect to your database</h2>
          <p className="text-sm text-red-700 mb-4">{store.error}</p>
          <p className="text-sm text-amber-800">
            Double-check that your <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and
            {" "}<code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are correct and that you ran{" "}
            <code className="bg-amber-100 px-1 rounded">supabase/schema.sql</code> in the SQL Editor.
          </p>
        </div>
      </div>
    );
  }

  // Empty state: Supabase connected, no dogs yet
  if (store.dogs.length === 0 || !store.data) {
    return (
      <main className="min-h-screen">
        <Header
          dogs={store.dogs}
          selectedDogId={null}
          selected={null}
          onSelect={store.selectDog}
          onAddDog={(name) => store.addDog({ name, status: "in_rehab" })}
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-amber-900">No dogs yet</h2>
          <p className="text-amber-700 mt-2 mb-6">Add your first rescue from the menu in the top-right.</p>
          <button
            onClick={() => {
              const name = window.prompt("What's their name?");
              if (name && name.trim()) store.addDog({ name: name.trim(), status: "in_rehab" });
            }}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-sm"
          >
            + Add a dog
          </button>
        </div>
      </main>
    );
  }

  const { data } = store;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "health", label: "Health", icon: "🩺" },
    { id: "feeding", label: "Feeding", icon: "🍽️" },
    { id: "potty", label: "Potty", icon: "💩" },
    { id: "milestones", label: "Milestones", icon: "⭐" },
    { id: "journal", label: "Journal", icon: "📔" },
    { id: "stories", label: "Stories", icon: "📖" },
    { id: "vet", label: "Vet Checklists", icon: "✅" },
    { id: "resources", label: "Resources", icon: "🌡️" },
    { id: "tools", label: "Import/Export", icon: "📦" },
    { id: "report", label: "Adopter Report", icon: "💌" },
  ];

  return (
    <main className="min-h-screen pb-20">
      <Header
        dogs={store.dogs}
        selectedDogId={store.selectedDogId}
        selected={data.profile}
        onSelect={store.selectDog}
        onAddDog={(name) => store.addDog({ name, status: "in_rehab" })}
      />

      <div className="no-print text-center py-1 text-xs text-amber-500">☁️ Synced to your Supabase</div>

      <nav className="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-amber-200 px-4 py-2 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-amber-100 text-amber-900 shadow-sm"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProfileCard profile={data.profile} onUpdate={store.updateProfile} />
              <div className="lg:col-span-2">
                <QuickStats data={data} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthTimeline logs={data.healthLogs} compact onUpdate={store.updateHealthLogs} />
              <WeightTracker weights={data.weights} compact onUpdate={store.updateWeights} />
            </div>
          </div>
        )}

        {activeTab === "health" && <HealthTimeline logs={data.healthLogs} onUpdate={store.updateHealthLogs} />}
        {activeTab === "feeding" && <FeedingLog entries={data.feedings} onUpdate={store.updateFeedings} />}
        {activeTab === "potty" && <PottyLog entries={data.pottyLogs} onUpdate={store.updatePottyLogs} />}
        {activeTab === "milestones" && (
          <MilestoneTracker milestones={data.milestones} dob={data.profile.dateOfBirth} onUpdate={store.updateMilestones} />
        )}
        {activeTab === "journal" && <DailyNotes notes={data.dailyNotes} onUpdate={store.updateDailyNotes} />}
        {activeTab === "stories" && (
          <StoriesTab
            stories={data.stories}
            unavailable={store.storiesUnavailable}
            onAdd={store.addStory}
            onUpdate={store.updateStory}
            onRemove={store.removeStory}
          />
        )}
        {activeTab === "vet" && <VetChecklists checklists={data.vetChecklists} onUpdate={store.updateChecklists} />}
        {activeTab === "resources" && <Resources healthLogs={data.healthLogs} />}
        {activeTab === "tools" && (
          <DataTools
            data={data}
            onImport={store.replaceAllData}
            onArchive={() => {
              if (!store.selectedDogId) return;
              if (window.confirm(`Archive ${data.profile.name}? They'll be hidden from the main list. You can unarchive later via the database.`)) {
                store.archiveDog(store.selectedDogId);
              }
            }}
            onDelete={() => {
              if (!store.selectedDogId) return;
              if (window.confirm(`Permanently delete ${data.profile.name} and all their records? This cannot be undone.`)) {
                store.removeDog(store.selectedDogId);
              }
            }}
          />
        )}
        {activeTab === "report" && <AdopterReport data={data} />}
      </div>
    </main>
  );
}
