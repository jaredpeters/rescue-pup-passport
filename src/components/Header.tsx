"use client";

import { Dog } from "@/lib/types";
import { getAge } from "@/lib/helpers";
import DogSwitcher from "./DogSwitcher";

export default function Header({
  dogs,
  selectedDogId,
  selected,
  onSelect,
  onAddDog,
}: {
  dogs: Dog[];
  selectedDogId: string | null;
  selected: Dog | null;
  onSelect: (id: string) => void;
  onAddDog: (name: string) => void;
}) {
  return (
    <header className="no-print bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-b border-amber-200 px-4 py-5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-4xl paw-bounce">🐶</div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-900 truncate">
              {selected ? `${selected.name}'s Passport` : "Rescue Pup Passport"}
            </h1>
            {selected && (
              <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                {selected.dateOfBirth && <span className="font-medium">{getAge(selected.dateOfBirth)}</span>}
                {selected.dateOfBirth && <span className="mx-2">·</span>}
                <span>🐾 Rescued with love</span>
              </p>
            )}
          </div>
        </div>

        <DogSwitcher
          dogs={dogs}
          selectedDogId={selectedDogId}
          onSelect={onSelect}
          onAddDog={onAddDog}
        />
      </div>
    </header>
  );
}
