import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Supabase Schema Validation", () => {
  const schema = readFileSync(join(__dirname, "../../supabase/schema.sql"), "utf-8");

  it("schema file exists and is not empty", () => {
    expect(schema.length).toBeGreaterThan(0);
  });

  it("defines all required tables", () => {
    const requiredTables = [
      "puppy_profile",
      "weight_entries",
      "health_logs",
      "feeding_entries",
      "potty_logs",
      "milestones",
      "daily_notes",
      "vet_checklists",
      "checklist_items",
    ];

    for (const table of requiredTables) {
      expect(schema).toContain(`create table if not exists ${table}`);
    }
  });

  it("has RLS enabled on every table", () => {
    const tables = [
      "puppy_profile",
      "weight_entries",
      "health_logs",
      "feeding_entries",
      "potty_logs",
      "milestones",
      "daily_notes",
      "vet_checklists",
      "checklist_items",
    ];

    for (const table of tables) {
      expect(schema).toContain(`alter table ${table} enable row level security`);
      expect(schema).toContain(`on ${table} for all`);
    }
  });

  it("has foreign key references to puppy_profile", () => {
    const childTables = [
      "weight_entries",
      "health_logs",
      "feeding_entries",
      "potty_logs",
      "milestones",
      "daily_notes",
      "vet_checklists",
    ];

    for (const table of childTables) {
      const tableRegex = new RegExp(`create table if not exists ${table}[\\s\\S]*?puppy_id uuid references puppy_profile`);
      expect(schema).toMatch(tableRegex);
    }
  });

  it("checklist_items references vet_checklists", () => {
    expect(schema).toMatch(/checklist_id uuid references vet_checklists/);
  });

  it("has cascade deletes on child tables", () => {
    const cascadeCount = (schema.match(/on delete cascade/g) || []).length;
    // 7 child tables of puppy_profile + checklist_items → vet_checklists = 8
    expect(cascadeCount).toBeGreaterThanOrEqual(8);
  });

  it("has check constraints for health log categories", () => {
    expect(schema).toContain("vaccine");
    expect(schema).toContain("deworming");
    expect(schema).toContain("medication");
    expect(schema).toContain("symptom");
    expect(schema).toContain("vet_visit");
    expect(schema).toContain("injury");
  });

  it("has check constraints for severity levels", () => {
    expect(schema).toContain("'info'");
    expect(schema).toContain("'mild'");
    expect(schema).toContain("'moderate'");
    expect(schema).toContain("'urgent'");
  });

  it("has check constraints for potty types/consistencies", () => {
    expect(schema).toContain("'pee'");
    expect(schema).toContain("'poop'");
    expect(schema).toContain("'both'");
    expect(schema).toContain("'normal'");
    expect(schema).toContain("'diarrhea'");
    expect(schema).toContain("'blood'");
  });

  it("defines puppy_profile columns added for multi-dog support", () => {
    // New columns introduced for the open-source multi-dog refactor.
    expect(schema).toMatch(/date_rescued\s+date/);
    expect(schema).toMatch(/rescue_story\s+text/);
    expect(schema).toMatch(/archived\s+boolean/);
    expect(schema).toMatch(/status\s+text/);
  });

  it("status column has all five DogStatus values in check constraint", () => {
    // Extract the status check constraint
    const match = schema.match(/status\s+text[\s\S]*?check \(status in \(([^)]*)\)\)/);
    expect(match).not.toBeNull();
    const constraint = match![1];
    expect(constraint).toContain("'in_rehab'");
    expect(constraint).toContain("'ready_for_adoption'");
    expect(constraint).toContain("'adopted'");
    expect(constraint).toContain("'returned'");
    expect(constraint).toContain("'foster_only'");
  });

  it("has performance indexes", () => {
    expect(schema).toContain("create index");
    const indexCount = (schema.match(/create index/g) || []).length;
    expect(indexCount).toBeGreaterThanOrEqual(5);
  });

  it("has a partial index on status for non-archived dogs", () => {
    expect(schema).toMatch(/idx_profile_status[\s\S]*where archived = false/);
  });

  it("has updated_at trigger on profile", () => {
    expect(schema).toContain("update_updated_at");
    expect(schema).toContain("profile_updated_at");
  });

  it("drops trigger before recreating (idempotent)", () => {
    expect(schema).toContain("drop trigger if exists profile_updated_at");
  });
});
