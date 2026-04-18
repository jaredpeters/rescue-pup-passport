"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dog,
  DogData,
  PuppyData,
  WeightEntry,
  HealthLog,
  FeedingEntry,
  PottyEntry,
  Milestone,
  DailyNote,
  VetChecklist,
} from "./types";
import { generateId, getSelectedDogId, setSelectedDogId } from "./storage";
import { db, loadDogData, seedIfEmpty } from "./db";
import { isSupabaseConfigured } from "./supabase";

export interface DogStore {
  // Environment
  configured: boolean;
  loading: boolean;
  error: string | null;

  // Dogs
  dogs: Dog[];
  selectedDogId: string | null;
  selectDog: (id: string) => void;
  addDog: (partial: Partial<Omit<Dog, "id">>) => Promise<Dog | null>;
  renameDog: (id: string, name: string) => Promise<boolean>;
  archiveDog: (id: string) => Promise<boolean>;
  removeDog: (id: string) => Promise<boolean>;

  // Selected dog's full data (shape matches legacy PuppyData)
  data: PuppyData | null;

  // Profile
  updateProfile: (profile: Dog) => void;

  // Per-dog mutators
  addWeight: (entry: Omit<WeightEntry, "id">) => void;
  removeWeight: (id: string) => void;
  updateWeights: (weights: WeightEntry[]) => void;

  addHealthLog: (entry: Omit<HealthLog, "id">) => void;
  updateHealthLog: (id: string, updates: Partial<HealthLog>) => void;
  removeHealthLog: (id: string) => void;
  updateHealthLogs: (logs: HealthLog[]) => void;

  addFeeding: (entry: Omit<FeedingEntry, "id">) => void;
  removeFeeding: (id: string) => void;
  updateFeedings: (entries: FeedingEntry[]) => void;

  addPottyLog: (entry: Omit<PottyEntry, "id">) => void;
  removePottyLog: (id: string) => void;
  updatePottyLogs: (entries: PottyEntry[]) => void;

  addMilestone: (entry: Omit<Milestone, "id">) => void;
  removeMilestone: (id: string) => void;
  updateMilestones: (milestones: Milestone[]) => void;

  addDailyNote: (entry: Omit<DailyNote, "id">) => void;
  removeDailyNote: (id: string) => void;
  updateDailyNotes: (notes: DailyNote[]) => void;

  updateChecklists: (checklists: VetChecklist[]) => void;

  replaceAllData: (data: PuppyData) => void;
  reload: () => void;
}

function emptyData(profile: Dog): PuppyData {
  return {
    profile,
    weights: [],
    healthLogs: [],
    feedings: [],
    pottyLogs: [],
    milestones: [],
    dailyNotes: [],
    vetChecklists: [],
  };
}

export function useDogStore(): DogStore {
  const configured = isSupabaseConfigured();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogIdState] = useState<string | null>(null);
  const [dogData, setDogData] = useState<DogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef<DogData | null>(null);
  dataRef.current = dogData;

  // ── Initial load ──────────────────────────────────────

  const loadAll = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await seedIfEmpty();
      const fetched = await db.dogs.list();
      setDogs(fetched);

      if (fetched.length === 0) {
        setSelectedDogIdState(null);
        setDogData(null);
      } else {
        const pref = getSelectedDogId();
        const pick = fetched.find((d) => d.id === pref) ?? fetched[0];
        setSelectedDogIdState(pick.id);
        setSelectedDogId(pick.id);
        const data = await loadDogData(pick.id);
        setDogData(data);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Dog switching ─────────────────────────────────────

  const selectDog = useCallback(async (id: string) => {
    setSelectedDogIdState(id);
    setSelectedDogId(id);
    setDogData(null);
    try {
      const data = await loadDogData(id);
      setDogData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addDog = useCallback(async (partial: Partial<Omit<Dog, "id">>) => {
    const dog = await db.dogs.create(partial);
    if (!dog) return null;
    setDogs((d) => [...d, dog]);
    setSelectedDogIdState(dog.id);
    setSelectedDogId(dog.id);
    setDogData(emptyDataSlice());
    return dog;
  }, []);

  const renameDog = useCallback(async (id: string, name: string) => {
    const ok = await db.dogs.update(id, { name } as Partial<Dog>);
    if (ok) setDogs((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)));
    return ok;
  }, []);

  const archiveDog = useCallback(async (id: string) => {
    const ok = await db.dogs.archive(id);
    if (ok) {
      setDogs((ds) => ds.filter((d) => d.id !== id));
      if (selectedDogId === id) {
        const next = dogs.find((d) => d.id !== id);
        if (next) {
          setSelectedDogIdState(next.id);
          setSelectedDogId(next.id);
          const data = await loadDogData(next.id);
          setDogData(data);
        } else {
          setSelectedDogIdState(null);
          setSelectedDogId(null);
          setDogData(null);
        }
      }
    }
    return ok;
  }, [selectedDogId, dogs]);

  const removeDog = useCallback(async (id: string) => {
    const ok = await db.dogs.remove(id);
    if (ok) {
      setDogs((ds) => ds.filter((d) => d.id !== id));
      if (selectedDogId === id) {
        const next = dogs.find((d) => d.id !== id);
        if (next) {
          setSelectedDogIdState(next.id);
          setSelectedDogId(next.id);
          const data = await loadDogData(next.id);
          setDogData(data);
        } else {
          setSelectedDogIdState(null);
          setSelectedDogId(null);
          setDogData(null);
        }
      }
    }
    return ok;
  }, [selectedDogId, dogs]);

  // ── Profile update ────────────────────────────────────

  const updateProfile = useCallback((profile: Dog) => {
    if (!selectedDogId) return;
    setDogs((ds) => ds.map((d) => (d.id === profile.id ? profile : d)));
    db.dogs.update(profile.id, profile);
  }, [selectedDogId]);

  // ── Generic helper for optimistic add ─────────────────

  const addChildRow = useCallback(
    async <T extends { id: string }>(
      key: keyof DogData,
      dbAdd: (dogId: string, entry: T) => Promise<string | null>,
      entry: Omit<T, "id">,
    ) => {
      if (!selectedDogId || !dataRef.current) return;
      const tempId = generateId();
      const full = { ...entry, id: tempId } as T;
      setDogData((prev) => prev ? ({ ...prev, [key]: [...(prev[key] as unknown as T[]), full] }) : prev);
      const realId = await dbAdd(selectedDogId, full);
      if (realId && realId !== tempId) {
        setDogData((prev) =>
          prev
            ? ({
                ...prev,
                [key]: (prev[key] as unknown as T[]).map((r) => (r.id === tempId ? { ...r, id: realId } : r)),
              })
            : prev,
        );
      }
    },
    [selectedDogId],
  );

  const removeChildRow = useCallback(
    async <T extends { id: string }>(
      key: keyof DogData,
      dbRemove: (id: string) => Promise<boolean>,
      id: string,
    ) => {
      setDogData((prev) =>
        prev ? ({ ...prev, [key]: (prev[key] as unknown as T[]).filter((r) => r.id !== id) }) : prev,
      );
      await dbRemove(id);
    },
    [],
  );

  // ── Weights ───────────────────────────────────────────

  const addWeight = useCallback((entry: Omit<WeightEntry, "id">) => {
    addChildRow<WeightEntry>("weights", db.weights.add, entry);
  }, [addChildRow]);

  const removeWeight = useCallback((id: string) => {
    removeChildRow<WeightEntry>("weights", db.weights.remove, id);
  }, [removeChildRow]);

  const updateWeights = useCallback((weights: WeightEntry[]) => {
    setDogData((prev) => prev ? ({ ...prev, weights }) : prev);
  }, []);

  // ── Health logs ───────────────────────────────────────

  const addHealthLog = useCallback((entry: Omit<HealthLog, "id">) => {
    addChildRow<HealthLog>("healthLogs", db.healthLogs.add, entry);
  }, [addChildRow]);

  const updateHealthLog = useCallback((id: string, updates: Partial<HealthLog>) => {
    setDogData((prev) => prev ? ({ ...prev, healthLogs: prev.healthLogs.map((h) => h.id === id ? { ...h, ...updates } : h) }) : prev);
    db.healthLogs.update(id, updates);
  }, []);

  const removeHealthLog = useCallback((id: string) => {
    removeChildRow<HealthLog>("healthLogs", db.healthLogs.remove, id);
  }, [removeChildRow]);

  const updateHealthLogs = useCallback((logs: HealthLog[]) => {
    setDogData((prev) => prev ? ({ ...prev, healthLogs: logs }) : prev);
  }, []);

  // ── Feedings ──────────────────────────────────────────

  const addFeeding = useCallback((entry: Omit<FeedingEntry, "id">) => {
    addChildRow<FeedingEntry>("feedings", db.feedings.add, entry);
  }, [addChildRow]);

  const removeFeeding = useCallback((id: string) => {
    removeChildRow<FeedingEntry>("feedings", db.feedings.remove, id);
  }, [removeChildRow]);

  const updateFeedings = useCallback((entries: FeedingEntry[]) => {
    setDogData((prev) => prev ? ({ ...prev, feedings: entries }) : prev);
  }, []);

  // ── Potty ─────────────────────────────────────────────

  const addPottyLog = useCallback((entry: Omit<PottyEntry, "id">) => {
    addChildRow<PottyEntry>("pottyLogs", db.pottyLogs.add, entry);
  }, [addChildRow]);

  const removePottyLog = useCallback((id: string) => {
    removeChildRow<PottyEntry>("pottyLogs", db.pottyLogs.remove, id);
  }, [removeChildRow]);

  const updatePottyLogs = useCallback((entries: PottyEntry[]) => {
    setDogData((prev) => prev ? ({ ...prev, pottyLogs: entries }) : prev);
  }, []);

  // ── Milestones ────────────────────────────────────────

  const addMilestone = useCallback((entry: Omit<Milestone, "id">) => {
    addChildRow<Milestone>("milestones", db.milestones.add, entry);
  }, [addChildRow]);

  const removeMilestone = useCallback((id: string) => {
    removeChildRow<Milestone>("milestones", db.milestones.remove, id);
  }, [removeChildRow]);

  const updateMilestones = useCallback((milestones: Milestone[]) => {
    setDogData((prev) => prev ? ({ ...prev, milestones }) : prev);
  }, []);

  // ── Daily notes ───────────────────────────────────────

  const addDailyNote = useCallback((entry: Omit<DailyNote, "id">) => {
    addChildRow<DailyNote>("dailyNotes", db.dailyNotes.add, entry);
  }, [addChildRow]);

  const removeDailyNote = useCallback((id: string) => {
    removeChildRow<DailyNote>("dailyNotes", db.dailyNotes.remove, id);
  }, [removeChildRow]);

  const updateDailyNotes = useCallback((notes: DailyNote[]) => {
    setDogData((prev) => prev ? ({ ...prev, dailyNotes: notes }) : prev);
  }, []);

  // ── Checklists (item-level updates) ───────────────────

  const updateChecklists = useCallback((checklists: VetChecklist[]) => {
    const prev = dataRef.current;
    setDogData((p) => p ? ({ ...p, vetChecklists: checklists }) : p);
    if (!prev) return;
    for (const newCl of checklists) {
      const oldCl = prev.vetChecklists.find((c) => c.id === newCl.id);
      if (!oldCl) continue;
      for (let i = 0; i < newCl.items.length; i++) {
        const newItem = newCl.items[i];
        const oldItem = oldCl.items[i];
        if (!oldItem) continue;
        if (newItem.done !== oldItem.done || newItem.notes !== oldItem.notes) {
          const itemId = (newItem as unknown as { id?: string }).id;
          if (itemId) {
            db.checklists.updateItem(itemId, { done: newItem.done, notes: newItem.notes });
          }
        }
      }
    }
  }, []);

  // ── Import: replace everything for selected dog ───────
  // Deletes existing per-dog rows and inserts the imported ones. Profile
  // is updated in place.

  const replaceAllData = useCallback(async (incoming: PuppyData) => {
    if (!selectedDogId) return;
    setDogData({
      weights: incoming.weights,
      healthLogs: incoming.healthLogs,
      feedings: incoming.feedings,
      pottyLogs: incoming.pottyLogs,
      milestones: incoming.milestones,
      dailyNotes: incoming.dailyNotes,
      vetChecklists: incoming.vetChecklists,
    });
    setDogs((ds) => ds.map((d) => d.id === selectedDogId ? { ...d, ...incoming.profile, id: selectedDogId } : d));
    // Persist profile; per-row bulk-replace of child tables is left as
    // future work — for now, a component-level merge via add/remove is
    // the safer path.
    await db.dogs.update(selectedDogId, { ...incoming.profile, id: selectedDogId } as Partial<Dog>);
  }, [selectedDogId]);

  // ── Composed PuppyData for consumers ──────────────────

  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? null;
  const data: PuppyData | null = selectedDog && dogData
    ? { profile: selectedDog, ...dogData }
    : null;

  return {
    configured,
    loading,
    error,

    dogs,
    selectedDogId,
    selectDog,
    addDog,
    renameDog,
    archiveDog,
    removeDog,

    data,

    updateProfile,

    addWeight, removeWeight, updateWeights,
    addHealthLog, updateHealthLog, removeHealthLog, updateHealthLogs,
    addFeeding, removeFeeding, updateFeedings,
    addPottyLog, removePottyLog, updatePottyLogs,
    addMilestone, removeMilestone, updateMilestones,
    addDailyNote, removeDailyNote, updateDailyNotes,
    updateChecklists,

    replaceAllData,
    reload: loadAll,
  };
}

function emptyDataSlice(): DogData {
  return {
    weights: [], healthLogs: [], feedings: [], pottyLogs: [],
    milestones: [], dailyNotes: [], vetChecklists: [],
  };
}
