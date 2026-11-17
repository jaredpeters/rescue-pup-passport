import { getSupabase } from "./supabase";
import {
  Dog,
  DogData,
  WeightEntry,
  HealthLog,
  FeedingEntry,
  PottyEntry,
  Milestone,
  DailyNote,
  VetChecklist,
  Story,
} from "./types";
import { getSeedDogs } from "./storage";

// ── snake_case <-> camelCase helpers ──────────────────────

function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/([A-Z])/g, "_$1").toLowerCase()] = v;
  }
  return out;
}

function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

// ── Dog (profile) CRUD ────────────────────────────────────

/** Returns all non-archived dog profiles, oldest-first. */
export async function listDogs(): Promise<Dog[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("puppy_profile")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("listDogs:", error);
    return [];
  }
  return data.map((row) => toCamel(row) as unknown as Dog);
}

export async function getDog(id: string): Promise<Dog | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("puppy_profile")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toCamel(data) as unknown as Dog;
}

/** Inserts a new dog profile; Postgres assigns the UUID. Returns the saved row or null on error. */
export async function createDog(partial: Partial<Omit<Dog, "id">>): Promise<Dog | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const row = toSnake(partial as Record<string, unknown>);
  const { data, error } = await sb
    .from("puppy_profile")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    console.error("createDog:", error);
    return null;
  }
  return toCamel(data) as unknown as Dog;
}

export async function updateDog(id: string, updates: Partial<Dog>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const row = toSnake(updates as Record<string, unknown>);
  delete row.id;
  delete row.created_at;
  delete row.updated_at;

  const { error } = await sb.from("puppy_profile").update(row).eq("id", id);
  if (error) console.error("updateDog:", error);
  return !error;
}

export async function archiveDog(id: string): Promise<boolean> {
  return updateDog(id, { status: "adopted" } as Partial<Dog>).then(async (ok) => {
    if (!ok) return false;
    const sb = getSupabase();
    if (!sb) return false;
    const { error } = await sb.from("puppy_profile").update({ archived: true }).eq("id", id);
    return !error;
  });
}

export async function deleteDog(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("puppy_profile").delete().eq("id", id);
  if (error) console.error("deleteDog:", error);
  return !error;
}

// ── Graceful degradation for additive migrations ──────────
// If a deployment is missing a table added in a later migration, we detect
// the Postgres 42P01 "relation does not exist" error on load, flip this
// flag, and let the UI show a "run this migration" prompt instead of
// crashing the whole app.

let storiesTableMissing = false;

/** True if the `stories` table does not exist in the connected Supabase. */
export function isStoriesTableMissing(): boolean {
  return storiesTableMissing;
}

function isMissingRelationError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "42P01";
}

// ── Per-dog data CRUD ─────────────────────────────────────

type DogTable = "weight_entries" | "health_logs" | "feeding_entries" | "potty_logs" | "milestones" | "daily_notes" | "stories";

async function loadRows<T>(table: DogTable, dogId: string): Promise<T[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from(table)
    .select("*")
    .eq("puppy_id", dogId)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => toCamel(row) as unknown as T);
}

async function insertRow(table: DogTable, dogId: string, row: Record<string, unknown>): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const dbRow = toSnake(row);
  delete dbRow.id;
  dbRow.puppy_id = dogId;
  delete dbRow.created_at;

  const { data, error } = await sb.from(table).insert(dbRow).select("id").single();
  if (error) {
    console.error(`insertRow ${table}:`, error);
    return null;
  }
  return data.id;
}

async function deleteRow(table: string, id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from(table).delete().eq("id", id);
  return !error;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const dbUpdates = toSnake(updates);
  delete dbUpdates.id;
  delete dbUpdates.puppy_id;
  delete dbUpdates.created_at;

  const { error } = await sb.from(table).update(dbUpdates).eq("id", id);
  return !error;
}

// ── Stories CRUD (custom: empty-string dates → null) ──────

function nullifyEmptyDate(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

async function addStory(dogId: string, story: Story): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("stories")
    .insert({
      puppy_id: dogId,
      title: story.title,
      body: story.body,
      start_date: nullifyEmptyDate(story.startDate),
      end_date: nullifyEmptyDate(story.endDate),
    })
    .select("id")
    .single();
  if (error) {
    if (isMissingRelationError(error)) storiesTableMissing = true;
    console.error("addStory:", error);
    return null;
  }
  return data.id;
}

async function updateStory(id: string, updates: Partial<Story>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.body !== undefined) dbUpdates.body = updates.body;
  if (updates.startDate !== undefined) dbUpdates.start_date = nullifyEmptyDate(updates.startDate);
  if (updates.endDate !== undefined) dbUpdates.end_date = nullifyEmptyDate(updates.endDate);
  const { error } = await sb.from("stories").update(dbUpdates).eq("id", id);
  if (error) console.error("updateStory:", error);
  return !error;
}

async function removeStory(id: string): Promise<boolean> {
  return deleteRow("stories", id);
}

// ── Vet checklists (nested) ───────────────────────────────

async function loadChecklists(dogId: string): Promise<VetChecklist[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("vet_checklists")
    .select("*, checklist_items(*)")
    .eq("puppy_id", dogId)
    .order("week_age", { ascending: true });

  if (error || !data) return [];

  return data.map((cl) => ({
    id: cl.id,
    weekAge: cl.week_age,
    items: (cl.checklist_items || [])
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.sort_order as number) - (b.sort_order as number))
      .map((item: Record<string, unknown>) => ({
        id: item.id as string,
        label: item.label as string,
        done: item.done as boolean,
        dueDate: (item.due_date as string) || "",
        notes: (item.notes as string) || "",
      })),
  })) as VetChecklist[];
}

async function updateChecklistItem(itemId: string, updates: { done?: boolean; notes?: string }): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.done !== undefined) dbUpdates.done = updates.done;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { error } = await sb.from("checklist_items").update(dbUpdates).eq("id", itemId);
  return !error;
}

// ── Load full data slice for one dog ──────────────────────

async function loadStories(dogId: string): Promise<Story[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("stories")
    .select("*")
    .eq("puppy_id", dogId)
    .order("start_date", { ascending: false, nullsFirst: false });

  if (error) {
    if (isMissingRelationError(error)) {
      storiesTableMissing = true;
      return [];
    }
    console.error("loadStories:", error);
    return [];
  }
  if (!data) return [];
  storiesTableMissing = false;
  return data.map((row) => {
    const camel = toCamel(row) as Record<string, unknown>;
    return {
      id: camel.id as string,
      title: (camel.title as string) || "",
      body: (camel.body as string) || "",
      startDate: (camel.startDate as string) || "",
      endDate: (camel.endDate as string) || "",
    };
  });
}

/** Fan-out load of all per-dog child rows (weights, health logs, feedings, etc.) for one dog. */
export async function loadDogData(dogId: string): Promise<DogData> {
  const [weights, healthLogs, feedings, pottyLogs, milestones, dailyNotes, vetChecklists, stories] = await Promise.all([
    loadRows<WeightEntry>("weight_entries", dogId),
    loadRows<HealthLog>("health_logs", dogId),
    loadRows<FeedingEntry>("feeding_entries", dogId),
    loadRows<PottyEntry>("potty_logs", dogId),
    loadRows<Milestone>("milestones", dogId),
    loadRows<DailyNote>("daily_notes", dogId),
    loadChecklists(dogId),
    loadStories(dogId),
  ]);

  return { weights, healthLogs, feedings, pottyLogs, milestones, dailyNotes, vetChecklists, stories };
}

// ── Seed the 3 demo dogs on first connect ─────────────────

/** Inserts the three demo dogs if `puppy_profile` is empty. No-op otherwise. */
export async function seedIfEmpty(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { count } = await sb.from("puppy_profile").select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  for (const seed of getSeedDogs()) {
    const { profile, weights, healthLogs, feedings, pottyLogs, milestones, dailyNotes, vetChecklists, stories } = seed;
    const dog = await createDog(profile);
    if (!dog) continue;

    for (const w of weights) await insertRow("weight_entries", dog.id, w as unknown as Record<string, unknown>);
    for (const h of healthLogs) await insertRow("health_logs", dog.id, h as unknown as Record<string, unknown>);
    for (const f of feedings) await insertRow("feeding_entries", dog.id, f as unknown as Record<string, unknown>);
    for (const p of pottyLogs) await insertRow("potty_logs", dog.id, p as unknown as Record<string, unknown>);
    for (const m of milestones) await insertRow("milestones", dog.id, m as unknown as Record<string, unknown>);
    for (const n of dailyNotes) await insertRow("daily_notes", dog.id, n as unknown as Record<string, unknown>);
    if (stories) {
      for (const s of stories) await addStory(dog.id, s);
    }

    for (const cl of vetChecklists) {
      const { data } = await sb
        .from("vet_checklists")
        .insert({ puppy_id: dog.id, week_age: cl.weekAge })
        .select("id")
        .single();

      if (data) {
        for (let i = 0; i < cl.items.length; i++) {
          const item = cl.items[i];
          await sb.from("checklist_items").insert({
            checklist_id: data.id,
            label: item.label,
            done: item.done,
            due_date: item.dueDate || null,
            notes: item.notes || "",
            sort_order: i,
          });
        }
      }
    }
  }
}

// ── Typed mutation surface used by the store ──────────────

export const db = {
  dogs: {
    list: listDogs,
    get: getDog,
    create: createDog,
    update: updateDog,
    archive: archiveDog,
    remove: deleteDog,
  },
  weights: {
    add: (dogId: string, entry: WeightEntry) => insertRow("weight_entries", dogId, entry as unknown as Record<string, unknown>),
    remove: (id: string) => deleteRow("weight_entries", id),
  },
  healthLogs: {
    add: (dogId: string, entry: HealthLog) => insertRow("health_logs", dogId, entry as unknown as Record<string, unknown>),
    update: (id: string, updates: Partial<HealthLog>) => updateRow("health_logs", id, updates as Record<string, unknown>),
    remove: (id: string) => deleteRow("health_logs", id),
  },
  feedings: {
    add: (dogId: string, entry: FeedingEntry) => insertRow("feeding_entries", dogId, entry as unknown as Record<string, unknown>),
    remove: (id: string) => deleteRow("feeding_entries", id),
  },
  pottyLogs: {
    add: (dogId: string, entry: PottyEntry) => insertRow("potty_logs", dogId, entry as unknown as Record<string, unknown>),
    remove: (id: string) => deleteRow("potty_logs", id),
  },
  milestones: {
    add: (dogId: string, entry: Milestone) => insertRow("milestones", dogId, entry as unknown as Record<string, unknown>),
    remove: (id: string) => deleteRow("milestones", id),
  },
  dailyNotes: {
    add: (dogId: string, entry: DailyNote) => insertRow("daily_notes", dogId, entry as unknown as Record<string, unknown>),
    remove: (id: string) => deleteRow("daily_notes", id),
  },
  stories: {
    add: addStory,
    update: updateStory,
    remove: removeStory,
  },
  checklists: {
    updateItem: updateChecklistItem,
  },
};
