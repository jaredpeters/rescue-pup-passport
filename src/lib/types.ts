export type DogStatus =
  | "in_rehab"
  | "ready_for_adoption"
  | "adopted"
  | "returned"
  | "foster_only";

export interface Dog {
  id: string;
  name: string;
  breed: string;
  color: string;
  sex: string;
  dateOfBirth: string;
  microchipId: string;
  photoUrl: string;
  personality: string;
  rescueStory: string;
  dateRescued: string;
  status: DogStatus;
  adoptionDate: string;
  adopterName: string;
  adopterContact: string;
}

export type PuppyProfile = Dog;

export interface WeightEntry {
  id: string;
  date: string;
  weightLbs: number;
  notes: string;
}

export interface HealthLog {
  id: string;
  date: string;
  category: "vaccine" | "deworming" | "medication" | "symptom" | "vet_visit" | "injury" | "other";
  title: string;
  details: string;
  severity: "info" | "mild" | "moderate" | "urgent";
  resolved: boolean;
}

export interface FeedingEntry {
  id: string;
  date: string;
  time: string;
  foodType: string;
  amount: string;
  ate: "all" | "most" | "some" | "none";
  notes: string;
}

export interface PottyEntry {
  id: string;
  date: string;
  time: string;
  type: "pee" | "poop" | "both";
  location: "inside" | "outside" | "pad";
  consistency: "normal" | "soft" | "diarrhea" | "hard" | "blood";
  notes: string;
}

export interface Milestone {
  id: string;
  date: string;
  category: "development" | "social" | "training" | "health" | "first";
  title: string;
  description: string;
  achieved: boolean;
}

export interface DailyNote {
  id: string;
  date: string;
  mood: "happy" | "playful" | "sleepy" | "fussy" | "sick" | "calm";
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  notes: string;
}

export interface VetChecklist {
  id: string;
  weekAge: number;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  label: string;
  done: boolean;
  dueDate: string;
  notes: string;
}

export interface DogData {
  weights: WeightEntry[];
  healthLogs: HealthLog[];
  feedings: FeedingEntry[];
  pottyLogs: PottyEntry[];
  milestones: Milestone[];
  dailyNotes: DailyNote[];
  vetChecklists: VetChecklist[];
}

export interface PuppyData extends DogData {
  profile: Dog;
}

export interface SeedDog extends DogData {
  profile: Omit<Dog, "id">;
}
