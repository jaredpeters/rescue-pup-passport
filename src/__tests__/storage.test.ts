import { describe, it, expect, beforeEach } from "vitest";
import {
  generateId,
  getSeedDogs,
  exportDataAsJson,
  importDataFromJson,
  importVetCsv,
  getSelectedDogId,
  setSelectedDogId,
} from "@/lib/storage";
import { PuppyData } from "@/lib/types";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("getSeedDogs", () => {
  const seeds = getSeedDogs();

  it("returns three seed dogs", () => {
    expect(seeds.length).toBe(3);
  });

  it("covers the three intended archetypes", () => {
    const names = seeds.map((s) => s.profile.name).sort();
    expect(names).toEqual(["Biscuit", "Moose", "Willa"]);
  });

  it("each seed has a populated profile without id", () => {
    for (const seed of seeds) {
      expect(seed.profile.name).toBeTruthy();
      expect(seed.profile.status).toBeTruthy();
      // SeedDog profile should not carry a db id
      expect((seed.profile as unknown as { id?: string }).id).toBeUndefined();
    }
  });

  it("statuses are all valid DogStatus values", () => {
    const valid = ["in_rehab", "ready_for_adoption", "adopted", "returned", "foster_only"];
    for (const seed of seeds) {
      expect(valid).toContain(seed.profile.status);
    }
  });

  it("every seed has weights, health logs, feedings, and daily notes", () => {
    for (const seed of seeds) {
      expect(seed.weights.length).toBeGreaterThan(0);
      expect(seed.healthLogs.length).toBeGreaterThan(0);
      expect(seed.feedings.length).toBeGreaterThan(0);
      expect(seed.dailyNotes.length).toBeGreaterThan(0);
    }
  });

  it("Biscuit (puppy) has vet checklists — Willa and Moose (adults) don't need them", () => {
    const biscuit = seeds.find((s) => s.profile.name === "Biscuit")!;
    const willa = seeds.find((s) => s.profile.name === "Willa")!;
    const moose = seeds.find((s) => s.profile.name === "Moose")!;

    expect(biscuit.vetChecklists.length).toBeGreaterThan(0);
    expect(willa.vetChecklists.length).toBe(0);
    expect(moose.vetChecklists.length).toBe(0);
  });

  it("seed IDs are unique within each dog", () => {
    for (const seed of seeds) {
      const ids = [
        ...seed.healthLogs.map((h) => h.id),
        ...seed.weights.map((w) => w.id),
        ...seed.feedings.map((f) => f.id),
        ...seed.pottyLogs.map((p) => p.id),
        ...seed.milestones.map((m) => m.id),
        ...seed.dailyNotes.map((n) => n.id),
        ...seed.vetChecklists.map((c) => c.id),
      ];
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("all dates are valid ISO format (YYYY-MM-DD) or empty", () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const seed of seeds) {
      for (const w of seed.weights) expect(w.date).toMatch(dateRegex);
      for (const h of seed.healthLogs) expect(h.date).toMatch(dateRegex);
      for (const p of seed.pottyLogs) expect(p.date).toMatch(dateRegex);
      for (const n of seed.dailyNotes) expect(n.date).toMatch(dateRegex);
      for (const m of seed.milestones) {
        if (m.date) expect(m.date).toMatch(dateRegex);
      }
    }
  });

  it("all health log categories are valid", () => {
    const valid = ["vaccine", "deworming", "medication", "symptom", "vet_visit", "injury", "other"];
    for (const seed of seeds) {
      for (const log of seed.healthLogs) {
        expect(valid).toContain(log.category);
      }
    }
  });

  it("all health log severities are valid", () => {
    const valid = ["info", "mild", "moderate", "urgent"];
    for (const seed of seeds) {
      for (const log of seed.healthLogs) {
        expect(valid).toContain(log.severity);
      }
    }
  });

  it("all potty log fields are valid", () => {
    const types = ["pee", "poop", "both"];
    const locations = ["inside", "outside", "pad"];
    const consistencies = ["normal", "soft", "diarrhea", "hard", "blood"];
    for (const seed of seeds) {
      for (const p of seed.pottyLogs) {
        expect(types).toContain(p.type);
        expect(locations).toContain(p.location);
        expect(consistencies).toContain(p.consistency);
      }
    }
  });

  it("all daily notes have valid mood and energy", () => {
    const moods = ["happy", "playful", "sleepy", "fussy", "sick", "calm"];
    for (const seed of seeds) {
      for (const note of seed.dailyNotes) {
        expect(moods).toContain(note.mood);
        expect(note.energyLevel).toBeGreaterThanOrEqual(1);
        expect(note.energyLevel).toBeLessThanOrEqual(5);
      }
    }
  });

  it("all milestone categories are valid", () => {
    const valid = ["development", "social", "training", "health", "first"];
    for (const seed of seeds) {
      for (const m of seed.milestones) {
        expect(valid).toContain(m.category);
      }
    }
  });

  it("Biscuit's vet checklists cover realistic puppy ages", () => {
    const biscuit = seeds.find((s) => s.profile.name === "Biscuit")!;
    const weeks = biscuit.vetChecklists.map((c) => c.weekAge).sort((a, b) => a - b);
    expect(weeks).toEqual([6, 8, 12, 16]);

    for (const cl of biscuit.vetChecklists) {
      expect(cl.items.length).toBeGreaterThan(0);
      for (const item of cl.items) {
        expect(item.label).toBeTruthy();
        expect(typeof item.done).toBe("boolean");
      }
    }
  });
});

describe("getSelectedDogId / setSelectedDogId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing has been saved", () => {
    expect(getSelectedDogId()).toBeNull();
  });

  it("round-trips an id through localStorage", () => {
    setSelectedDogId("dog-123");
    expect(getSelectedDogId()).toBe("dog-123");
  });

  it("clears the id when passed null", () => {
    setSelectedDogId("dog-456");
    setSelectedDogId(null);
    expect(getSelectedDogId()).toBeNull();
  });
});

describe("exportDataAsJson / importDataFromJson", () => {
  function sampleData(): PuppyData {
    const seed = getSeedDogs()[0];
    return { profile: { ...seed.profile, id: "test-id" }, ...seed };
  }

  it("round-trips through JSON export/import", () => {
    const data = sampleData();
    data.profile.name = "ExportTest";
    data.weights = [{ id: "ew1", date: "2026-04-01", weightLbs: 4.0, notes: "test" }];

    const json = exportDataAsJson(data);
    const imported = importDataFromJson(json);

    expect(imported).not.toBeNull();
    expect(imported!.profile.name).toBe("ExportTest");
    expect(imported!.weights.length).toBe(1);
    expect(imported!.weights[0].weightLbs).toBe(4.0);
  });

  it("returns null for invalid JSON", () => {
    expect(importDataFromJson("not json")).toBeNull();
  });

  it("returns null for JSON missing required fields", () => {
    expect(importDataFromJson('{"foo": "bar"}')).toBeNull();
  });

  it("exports valid JSON string", () => {
    const json = exportDataAsJson(sampleData());
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe("importVetCsv", () => {
  it("imports health records from CSV", () => {
    const csv = `date,type,title,details,severity
2026-03-29,vaccine,DHPP #1,First round,info
2026-03-29,deworming,Pyrantel,Deworming treatment,info
2026-03-30,symptom,Diarrhea,Loose stool,mild`;

    const result = importVetCsv(csv);
    expect(result.healthLogs.length).toBe(3);
    expect(result.healthLogs[0].category).toBe("vaccine");
    expect(result.healthLogs[0].title).toBe("DHPP #1");
    expect(result.healthLogs[1].category).toBe("deworming");
    expect(result.healthLogs[2].severity).toBe("mild");
  });

  it("imports weight entries from CSV", () => {
    const csv = `date,type,title,details,severity
2026-03-29,weight,3.2,First weigh-in,info
2026-04-05,weight,3.8,Second weigh-in,info`;

    const result = importVetCsv(csv);
    expect(result.weights.length).toBe(2);
    expect(result.weights[0].weightLbs).toBe(3.2);
    expect(result.weights[1].weightLbs).toBe(3.8);
  });

  it("handles mixed health records and weights", () => {
    const csv = `date,type,title,details,severity
2026-03-29,vaccine,DHPP,Shot,info
2026-03-29,weight,3.2,Weigh-in,info`;

    const result = importVetCsv(csv);
    expect(result.healthLogs.length).toBe(1);
    expect(result.weights.length).toBe(1);
  });

  it("handles empty CSV", () => {
    const csv = `date,type,title,details,severity`;
    const result = importVetCsv(csv);
    expect(result.healthLogs.length).toBe(0);
    expect(result.weights.length).toBe(0);
  });

  it("skips malformed rows", () => {
    const csv = `date,type,title,details,severity
2026-03-29,vaccine,DHPP,Shot,info
bad,row
2026-03-30,symptom,Vomiting,Once,mild`;

    const result = importVetCsv(csv);
    expect(result.healthLogs.length).toBe(2);
  });
});
