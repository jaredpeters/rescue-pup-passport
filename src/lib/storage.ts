import { PuppyData, SeedDog } from "./types";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── UI state persistence (selected dog id) ────────────────
// This is the ONLY thing the app stores in localStorage now. It's just a
// pointer to "which dog was I looking at last?" — the actual data lives
// in Supabase. Safe to lose; the app will fall back to the first dog.

const SELECTED_DOG_KEY = "rpp-selected-dog-id";

export function getSelectedDogId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SELECTED_DOG_KEY);
  } catch {
    return null;
  }
}

export function setSelectedDogId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(SELECTED_DOG_KEY, id);
    else localStorage.removeItem(SELECTED_DOG_KEY);
  } catch {
    // ignore
  }
}

// ── JSON export / import (per-dog backup file) ────────────

export function exportDataAsJson(data: PuppyData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(json: string): PuppyData | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.profile && Array.isArray(parsed.weights) && Array.isArray(parsed.healthLogs)) {
      return parsed as PuppyData;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Vet CSV import ────────────────────────────────────────

export function importVetCsv(csv: string): { healthLogs: PuppyData["healthLogs"]; weights: PuppyData["weights"] } {
  const lines = csv.trim().split("\n");
  const healthLogs: PuppyData["healthLogs"] = [];
  const weights: PuppyData["weights"] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length >= 4) {
      const [date, type, title, details, severity] = cols;
      if (type === "weight") {
        weights.push({ id: generateId(), date, weightLbs: parseFloat(title), notes: details || "" });
      } else {
        healthLogs.push({
          id: generateId(),
          date,
          category: (type as PuppyData["healthLogs"][0]["category"]) || "other",
          title: title || "",
          details: details || "",
          severity: (severity as "info" | "mild" | "moderate" | "urgent") || "info",
          resolved: false,
        });
      }
    }
  }
  return { healthLogs, weights };
}

// ── Seed dogs (first-run demo data) ───────────────────────
// These three fictional rescues ship with the app so that a new user sees
// a populated UI on first load and can explore every feature.
// They're inserted into Supabase only on FIRST connect to an empty database.
// Users can delete them and add their own real rescues.

/** Three fictional demo dogs (Willa, Biscuit, Moose) inserted into Supabase on first connect. */
export function getSeedDogs(): SeedDog[] {
  return [seedWilla(), seedBiscuit(), seedMoose()];
}

function seedWilla(): SeedDog {
  return {
    profile: {
      name: "Willa",
      breed: "Shepherd mix",
      color: "Sable with white chest",
      sex: "Female",
      dateOfBirth: "2022-03-20",
      dateRescued: "2026-03-27",
      status: "in_rehab",
      microchipId: "",
      photoUrl: "",
      personality:
        "Anxious on arrival — wouldn't eat with anyone watching, hid under the bed for most of week one. Slowly warming. Gentle, thoughtful, and surprisingly bonded with the resident cat Miso. Does not like sudden sounds or hands over her head.",
      rescueStory:
        "Surrendered from a hoarding situation (27 dogs in one home). Estimated 4 years old, never socialized outside the house. Spent her first week in my quiet back bedroom with a bed, a water bowl, and closed blinds.",
      adoptionDate: "",
      adopterName: "",
      adopterContact: "",
    },
    weights: [
      { id: "willa-w1", date: "2026-03-27", weightLbs: 38.5, notes: "Intake weigh-in. Underweight — ribs visible." },
      { id: "willa-w2", date: "2026-04-03", weightLbs: 39.2, notes: "Eating better when alone." },
      { id: "willa-w3", date: "2026-04-10", weightLbs: 41.0, notes: "Appetite improving. Will eat with me in the room now." },
      { id: "willa-w4", date: "2026-04-16", weightLbs: 42.4, notes: "Healthy trajectory." },
    ],
    healthLogs: [
      {
        id: "willa-h1", date: "2026-03-27", category: "vet_visit", title: "Intake exam",
        details: "General exam. Dental wear consistent with ~4yr age. Underweight. Fecal sent out. No obvious injuries.",
        severity: "info", resolved: true,
      },
      {
        id: "willa-h2", date: "2026-03-27", category: "vaccine", title: "DHPP booster",
        details: "Vaccine history unknown. Restarting series.",
        severity: "info", resolved: true,
      },
      {
        id: "willa-h3", date: "2026-03-27", category: "deworming", title: "Broad-spectrum dewormer",
        details: "Prophylactic. Fecal results pending.",
        severity: "info", resolved: true,
      },
      {
        id: "willa-h4", date: "2026-03-29", category: "symptom", title: "Loose stool (stress-related)",
        details: "Two soft stools. Appetite still low. Likely stress/transition, not illness.",
        severity: "mild", resolved: true,
      },
      {
        id: "willa-h5", date: "2026-04-10", category: "vaccine", title: "DHPP #2 + Rabies",
        details: "Tolerated well. Much calmer at the vet this visit.",
        severity: "info", resolved: true,
      },
    ],
    feedings: [
      { id: "willa-f1", date: "2026-03-28", time: "08:00", foodType: "Adult kibble + chicken", amount: "1 cup", ate: "none", notes: "Left untouched. Too anxious." },
      { id: "willa-f2", date: "2026-03-28", time: "18:00", foodType: "Adult kibble + chicken", amount: "1 cup", ate: "some", notes: "Ate after I left the room." },
      { id: "willa-f3", date: "2026-04-02", time: "08:00", foodType: "Adult kibble + chicken", amount: "1 cup", ate: "most", notes: "Ate most with me sitting across the room." },
      { id: "willa-f4", date: "2026-04-10", time: "18:00", foodType: "Adult kibble + salmon oil", amount: "1 cup", ate: "all", notes: "Finished her bowl. Wagged her tail." },
      { id: "willa-f5", date: "2026-04-16", time: "08:00", foodType: "Adult kibble + salmon oil", amount: "1 cup", ate: "all", notes: "Now eats side-by-side with Moose." },
    ],
    pottyLogs: [
      { id: "willa-p1", date: "2026-03-28", time: "07:30", type: "pee", location: "pad", consistency: "normal", notes: "Wouldn't go outside yet." },
      { id: "willa-p2", date: "2026-04-01", time: "07:30", type: "both", location: "outside", consistency: "soft", notes: "First time out! Took 20 minutes of coaxing." },
      { id: "willa-p3", date: "2026-04-12", time: "07:30", type: "both", location: "outside", consistency: "normal", notes: "Walks to the yard on her own now." },
    ],
    milestones: [
      { id: "willa-m1", date: "2026-03-30", category: "first", title: "First meal finished", description: "Ate an entire bowl — after I left the room. Progress.", achieved: true },
      { id: "willa-m2", date: "2026-04-02", category: "social", title: "First time in the same room as Miso the cat", description: "Didn't run. Watched him groom himself for 10 minutes.", achieved: true },
      { id: "willa-m3", date: "2026-04-05", category: "training", title: "Came when called (quiet voice, once)", description: "From three feet away. Tail down but she came.", achieved: true },
      { id: "willa-m4", date: "2026-04-09", category: "social", title: "Played with Miso", description: "Gentle paw-bat game. Miso initiated. She responded. Everyone kept their claws/teeth in.", achieved: true },
      { id: "willa-m5", date: "2026-04-14", category: "first", title: "Slept on the couch next to me", description: "Hopped up on her own. Leaned in. Fell asleep.", achieved: true },
      { id: "willa-m6", date: "", category: "social", title: "Accept petting from a new person", description: "Target for weeks 4–6.", achieved: false },
    ],
    dailyNotes: [
      { id: "willa-n1", date: "2026-03-28", mood: "sick", energyLevel: 1, sleepHours: 16, notes: "Hid under the bed all day. Water bowl emptied. Good sign — she's drinking. Not eating when watched." },
      { id: "willa-n2", date: "2026-04-01", mood: "fussy", energyLevel: 2, sleepHours: 14, notes: "Came out of the bedroom twice. Froze when I stood up. Tail tucked. Left her alone with a Kong." },
      { id: "willa-n3", date: "2026-04-05", mood: "calm", energyLevel: 3, sleepHours: 12, notes: "Sat in the hallway and watched me cook. That's new. Took a piece of chicken from my hand." },
      { id: "willa-n4", date: "2026-04-09", mood: "playful", energyLevel: 4, sleepHours: 11, notes: "Played with Miso! Low bow, paw bat, little prance. First time I've seen her move like a dog her age. Cried a little honestly." },
      { id: "willa-n5", date: "2026-04-14", mood: "happy", energyLevel: 4, sleepHours: 10, notes: "Couch snuggle. Sighed and fell asleep with her head on my leg. She's going to be ok." },
    ],
    vetChecklists: [],
  };
}

function seedBiscuit(): SeedDog {
  return {
    profile: {
      name: "Biscuit",
      breed: "Shepherd mix (puppy)",
      color: "Tan with black mask",
      sex: "Male",
      dateOfBirth: "2026-02-27",
      dateRescued: "2026-04-05",
      status: "in_rehab",
      microchipId: "",
      photoUrl: "",
      personality:
        "Pure puppy. Chews everything, sleeps hard after meals, tries to eat his own tail, falls over when he runs. Loves people, loves dogs, loves the vacuum (weirdly).",
      rescueStory:
        "Found in a cardboard box by a hiking trail with two siblings (rehomed to another foster). Healthy, dewormed, growing fast.",
      adoptionDate: "",
      adopterName: "",
      adopterContact: "",
    },
    weights: [
      { id: "biscuit-w1", date: "2026-04-05", weightLbs: 2.1, notes: "Intake. ~6 weeks." },
      { id: "biscuit-w2", date: "2026-04-08", weightLbs: 2.4, notes: "Eating 4x/day." },
      { id: "biscuit-w3", date: "2026-04-12", weightLbs: 2.9, notes: "Growth spurt." },
      { id: "biscuit-w4", date: "2026-04-16", weightLbs: 3.4, notes: "Healthy curve." },
    ],
    healthLogs: [
      {
        id: "biscuit-h1", date: "2026-04-05", category: "vet_visit", title: "Intake exam",
        details: "Healthy puppy. Clean ears, clear eyes, no fleas visible. Bright and curious.",
        severity: "info", resolved: true,
      },
      {
        id: "biscuit-h2", date: "2026-04-05", category: "deworming", title: "Pyrantel (first dose)",
        details: "Standard puppy deworming. Tolerated well.",
        severity: "info", resolved: true,
      },
      {
        id: "biscuit-h3", date: "2026-04-05", category: "vaccine", title: "DHPP #1",
        details: "First combo vaccine.",
        severity: "info", resolved: true,
      },
      {
        id: "biscuit-h4", date: "2026-04-12", category: "other", title: "First bath",
        details: "Smelled like a puppy. Screamed like a banshee. Fine after.",
        severity: "info", resolved: true,
      },
    ],
    feedings: [
      { id: "biscuit-f1", date: "2026-04-16", time: "06:30", foodType: "Puppy kibble (softened)", amount: "1/4 cup", ate: "all", notes: "Inhaled it." },
      { id: "biscuit-f2", date: "2026-04-16", time: "11:00", foodType: "Puppy kibble (softened)", amount: "1/4 cup", ate: "all", notes: "" },
      { id: "biscuit-f3", date: "2026-04-16", time: "15:30", foodType: "Puppy kibble (softened)", amount: "1/4 cup", ate: "all", notes: "Fell asleep mid-chew." },
      { id: "biscuit-f4", date: "2026-04-16", time: "20:00", foodType: "Puppy kibble (softened)", amount: "1/4 cup", ate: "all", notes: "" },
    ],
    pottyLogs: [
      { id: "biscuit-p1", date: "2026-04-16", time: "06:45", type: "both", location: "outside", consistency: "normal", notes: "Good boy!" },
      { id: "biscuit-p2", date: "2026-04-16", time: "11:20", type: "pee", location: "outside", consistency: "normal", notes: "" },
      { id: "biscuit-p3", date: "2026-04-16", time: "14:00", type: "pee", location: "inside", consistency: "normal", notes: "Missed the cue — my fault." },
    ],
    milestones: [
      { id: "biscuit-m1", date: "2026-04-06", category: "first", title: "First bark!", description: "Tiny. Squeaky. Immediately startled himself.", achieved: true },
      { id: "biscuit-m2", date: "2026-04-09", category: "development", title: "Figured out stairs (two steps)", description: "Took three tries. Tail wagging the whole time.", achieved: true },
      { id: "biscuit-m3", date: "2026-04-11", category: "social", title: "Met a human child", description: "Licked her face. She screamed (happily). Tail didn't stop.", achieved: true },
      { id: "biscuit-m4", date: "2026-04-14", category: "training", title: "Sit — on cue, three times in a row", description: "With a treat held overhead. Still counts.", achieved: true },
      { id: "biscuit-m5", date: "", category: "health", title: "DHPP #2 at 9 weeks", description: "Scheduled for week of 2026-04-27.", achieved: false },
    ],
    dailyNotes: [
      { id: "biscuit-n1", date: "2026-04-13", mood: "playful", energyLevel: 5, sleepHours: 16, notes: "Discovered his own feet. Bit them. Cried. Bit them again." },
      { id: "biscuit-n2", date: "2026-04-15", mood: "sleepy", energyLevel: 3, sleepHours: 18, notes: "Growth spurt day — slept through two meals. Weighed him after: +4 oz." },
      { id: "biscuit-n3", date: "2026-04-16", mood: "happy", energyLevel: 5, sleepHours: 15, notes: "Zoomies at 6am. Zoomies at 9am. Zoomies at 11am. Sleeping now." },
    ],
    vetChecklists: [
      {
        id: "biscuit-cl1", weekAge: 6,
        items: [
          { label: "First vet exam", done: true, dueDate: "2026-04-05", notes: "Healthy." },
          { label: "DHPP #1", done: true, dueDate: "2026-04-05", notes: "" },
          { label: "Deworming #1", done: true, dueDate: "2026-04-05", notes: "Pyrantel" },
          { label: "Fecal test", done: false, dueDate: "2026-04-20", notes: "Re-check" },
          { label: "Weigh-in", done: true, dueDate: "2026-04-05", notes: "2.1 lbs" },
        ],
      },
      {
        id: "biscuit-cl2", weekAge: 8,
        items: [
          { label: "DHPP #2", done: false, dueDate: "2026-04-27", notes: "" },
          { label: "Deworming #2", done: false, dueDate: "2026-04-27", notes: "" },
          { label: "Start heartworm prevention", done: false, dueDate: "2026-04-27", notes: "" },
          { label: "Flea/tick prevention", done: false, dueDate: "2026-04-27", notes: "" },
        ],
      },
      {
        id: "biscuit-cl3", weekAge: 12,
        items: [
          { label: "DHPP #3", done: false, dueDate: "2026-05-25", notes: "" },
          { label: "Rabies vaccine", done: false, dueDate: "2026-05-25", notes: "" },
          { label: "Spay/neuter discussion", done: false, dueDate: "", notes: "" },
        ],
      },
      {
        id: "biscuit-cl4", weekAge: 16,
        items: [
          { label: "Final puppy boosters", done: false, dueDate: "2026-06-22", notes: "" },
          { label: "Bordetella vaccine", done: false, dueDate: "", notes: "" },
          { label: "Microchip implant", done: false, dueDate: "", notes: "" },
        ],
      },
    ],
  };
}

function seedMoose(): SeedDog {
  return {
    profile: {
      name: "Moose",
      breed: "Coonhound (guessing)",
      color: "Black and tan",
      sex: "Male",
      dateOfBirth: "2021-02-14",
      dateRescued: "2026-02-14",
      status: "ready_for_adoption",
      microchipId: "985141005271893",
      photoUrl: "",
      personality:
        "A walking sitcom. Sleeps upside-down on any soft surface. Steals socks and presents them to you like a gift. Howls at sirens with operatic commitment. 100% love, 0% trauma — whoever had him before him was kind, or he's just unreasonably well-adjusted.",
      rescueStory:
        "Found wandering a rural road on Valentine's Day. No chip, no tags, very well-fed and people-friendly. We posted for weeks — no one claimed him. He's happy. He's ready for his forever.",
      adoptionDate: "",
      adopterName: "",
      adopterContact: "",
    },
    weights: [
      { id: "moose-w1", date: "2026-02-14", weightLbs: 62.0, notes: "Intake. Great body condition." },
      { id: "moose-w2", date: "2026-03-14", weightLbs: 61.5, notes: "Right where we want him." },
      { id: "moose-w3", date: "2026-04-14", weightLbs: 62.2, notes: "Stable." },
    ],
    healthLogs: [
      {
        id: "moose-h1", date: "2026-02-14", category: "vet_visit", title: "Intake exam",
        details: "Estimated 5 yr old male coonhound. Excellent condition. Heartworm negative. All bloodwork normal.",
        severity: "info", resolved: true,
      },
      {
        id: "moose-h2", date: "2026-02-14", category: "vaccine", title: "DHPP + Rabies + Bordetella",
        details: "Full update — records unknown, restarted.",
        severity: "info", resolved: true,
      },
      {
        id: "moose-h3", date: "2026-02-28", category: "other", title: "Neutered",
        details: "Uncomplicated. Recovered quickly. Cone hated him, he hated the cone — mutual.",
        severity: "info", resolved: true,
      },
      {
        id: "moose-h4", date: "2026-03-10", category: "medication", title: "Heartworm prevention started",
        details: "Monthly chewable. Loves them, eats them like treats.",
        severity: "info", resolved: true,
      },
    ],
    feedings: [
      { id: "moose-f1", date: "2026-04-16", time: "07:00", foodType: "Adult large-breed kibble", amount: "2 cups", ate: "all", notes: "As always." },
      { id: "moose-f2", date: "2026-04-16", time: "18:00", foodType: "Adult large-breed kibble", amount: "2 cups", ate: "all", notes: "" },
    ],
    pottyLogs: [
      { id: "moose-p1", date: "2026-04-16", time: "07:30", type: "both", location: "outside", consistency: "normal", notes: "Housebroken from day one." },
      { id: "moose-p2", date: "2026-04-16", time: "13:00", type: "pee", location: "outside", consistency: "normal", notes: "" },
      { id: "moose-p3", date: "2026-04-16", time: "21:00", type: "both", location: "outside", consistency: "normal", notes: "" },
    ],
    milestones: [
      { id: "moose-m1", date: "2026-02-15", category: "first", title: "First sock theft", description: "Walked into the kitchen holding a sock. Tail wagging. Very proud.", achieved: true },
      { id: "moose-m2", date: "2026-02-20", category: "first", title: "First siren duet", description: "Fire engine down the street. Held the note for 14 seconds. I timed it.", achieved: true },
      { id: "moose-m3", date: "2026-03-01", category: "social", title: "Met six dogs at the park — no issues", description: "Polite sniff, play bow, ran around. Excellent dog social skills.", achieved: true },
      { id: "moose-m4", date: "2026-03-15", category: "training", title: "Knows: sit, down, paw, 'go to bed'", description: "Either someone trained him or he came pre-installed.", achieved: true },
      { id: "moose-m5", date: "2026-04-01", category: "social", title: "Met three children — gentle as can be", description: "Lay down so they could reach him. No jumping, no mouthing.", achieved: true },
    ],
    dailyNotes: [
      { id: "moose-n1", date: "2026-04-14", mood: "happy", energyLevel: 4, sleepHours: 13, notes: "Standard Moose day. Two walks, two meals, one sock theft, one (1) operatic howl at a passing ambulance." },
      { id: "moose-n2", date: "2026-04-15", mood: "playful", energyLevel: 4, sleepHours: 12, notes: "Dog park for an hour. Made three new friends. Came home and slept upside down for two hours." },
      { id: "moose-n3", date: "2026-04-16", mood: "calm", energyLevel: 3, sleepHours: 13, notes: "Lazy day. Rained. He watched the window intently and grumbled at every squirrel." },
    ],
    vetChecklists: [],
  };
}
