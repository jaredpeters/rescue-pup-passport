import { describe, it, expect, beforeEach } from "vitest";
import { isSupabaseConfigured } from "@/lib/supabase";

describe("isSupabaseConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns false when env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false when only URL is set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false for placeholder URL (template value)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project-id.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-key";
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns false for placeholder anon key (template value)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-public-key";
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns true when both env vars are set to non-placeholder values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiJ9.test.sig";
    expect(isSupabaseConfigured()).toBe(true);
  });
});
