import { describe, it, expect } from "vitest";
import {
  getAge,
  getAgeWeeks,
  formatDate,
  formatShortDate,
  todayISO,
  moodEmoji,
  severityColor,
  categoryIcon,
} from "@/lib/helpers";

describe("getAge", () => {
  it("returns weeks and days for a date in the past", () => {
    const age = getAge("2026-01-01");
    // Should contain "weeks" since this is well in the past
    expect(age).toMatch(/\d+ weeks/);
  });

  it("returns days for very young puppies", () => {
    // Use today's date to get 0 days
    const today = new Date().toISOString().split("T")[0];
    const age = getAge(today);
    expect(age).toMatch(/\d+ days old/);
  });
});

describe("getAgeWeeks", () => {
  it("returns a non-negative number of weeks", () => {
    const weeks = getAgeWeeks("2026-01-01");
    expect(weeks).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    expect(formatDate("2026-03-27")).toBe("Mar 27, 2026");
  });

  it("handles invalid dates gracefully", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatShortDate", () => {
  it("formats to short format", () => {
    expect(formatShortDate("2026-03-27")).toBe("Mar 27");
  });
});

describe("todayISO", () => {
  it("returns today in YYYY-MM-DD format", () => {
    const today = todayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("moodEmoji", () => {
  it("returns correct emoji for known moods", () => {
    expect(moodEmoji("happy")).toBe("😊");
    expect(moodEmoji("sick")).toBe("🤒");
    expect(moodEmoji("playful")).toBe("🐾");
    expect(moodEmoji("sleepy")).toBe("😴");
    expect(moodEmoji("calm")).toBe("😌");
  });

  it("returns default emoji for unknown mood", () => {
    expect(moodEmoji("unknown")).toBe("🐕");
  });
});

describe("severityColor", () => {
  it("returns CSS classes for each severity", () => {
    expect(severityColor("info")).toContain("bg-blue");
    expect(severityColor("mild")).toContain("bg-yellow");
    expect(severityColor("moderate")).toContain("bg-orange");
    expect(severityColor("urgent")).toContain("bg-red");
  });

  it("returns gray for unknown severity", () => {
    expect(severityColor("unknown")).toContain("bg-gray");
  });
});

describe("categoryIcon", () => {
  it("returns correct icon for each health category", () => {
    expect(categoryIcon("vaccine")).toBe("💉");
    expect(categoryIcon("deworming")).toBe("💊");
    expect(categoryIcon("symptom")).toBe("🩺");
    expect(categoryIcon("vet_visit")).toBe("🏥");
    expect(categoryIcon("injury")).toBe("🩹");
  });

  it("returns default icon for unknown category", () => {
    expect(categoryIcon("unknown")).toBe("📋");
  });
});
