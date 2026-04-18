import { format, differenceInWeeks, differenceInDays, parseISO } from "date-fns";

export function getAge(dob: string): string {
  const birth = parseISO(dob);
  const now = new Date();
  const weeks = differenceInWeeks(now, birth);
  const days = differenceInDays(now, birth) % 7;
  if (weeks < 1) return `${differenceInDays(now, birth)} days old`;
  return `${weeks} weeks, ${days} days old`;
}

export function getAgeWeeks(dob: string): number {
  return differenceInWeeks(new Date(), parseISO(dob));
}

export function formatDate(d: string): string {
  try {
    return format(parseISO(d), "MMM d, yyyy");
  } catch {
    return d;
  }
}

export function formatShortDate(d: string): string {
  try {
    return format(parseISO(d), "MMM d");
  } catch {
    return d;
  }
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowTime(): string {
  return format(new Date(), "HH:mm");
}

export function moodEmoji(mood: string): string {
  const moods: Record<string, string> = {
    happy: "😊",
    playful: "🐾",
    sleepy: "😴",
    fussy: "😤",
    sick: "🤒",
    calm: "😌",
  };
  return moods[mood] || "🐕";
}

export function severityColor(s: string): string {
  const colors: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    mild: "bg-yellow-100 text-yellow-800",
    moderate: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return colors[s] || "bg-gray-100 text-gray-800";
}

export function categoryIcon(c: string): string {
  const icons: Record<string, string> = {
    vaccine: "💉",
    deworming: "💊",
    medication: "💊",
    symptom: "🩺",
    vet_visit: "🏥",
    injury: "🩹",
    other: "📋",
  };
  return icons[c] || "📋";
}
