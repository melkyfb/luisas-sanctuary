/**
 * Pet Book Modal (Sanctuary Journal) for Luisa's Magical Pet Sanctuary
 * Displays species records, variants, adoption status, and favorite treats.
 */

import React, { useState } from 'react';
import { X, Heart, Sparkles, BookOpen, Utensils, Award } from 'lucide-react';
import { PetData, SpeciesId, SPECIES_CATALOG } from '../game/types';
import { soundManager } from '../game/audio';

interface PetBookModalProps {
  pets: PetData[];
  onClose: () => void;
  onSelectPetForCare?: (pet: PetData) => void;
}

export const PetBookModal: React.FC<PetBookModalProps> = ({
  pets,
  onClose,
  onSelectPetForCare,
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesId>('puppy');

  const speciesList = Object.keys(SPECIES_CATALOG) as SpeciesId[];
  const activeSpeciesInfo = SPECIES_CATALOG[selectedSpecies];

  // Pets matching this species
  const matchingPets = pets.filter((p) => p.species === selectedSpecies);
  const adoptedCount = matchingPets.filter((p) => p.isAdopted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100/70 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-200 rounded-full text-amber-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-['Fredoka']">
                Sanctuary Pet Journal
              </h2>
              <p className="text-xs text-amber-800 font-medium">
                {pets.filter((p) => p.isAdopted).length} of {pets.length} Magical Friends Adopted
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-amber-200 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Species Horizontal Grid */}
        <div className="px-6 py-3 bg-white/60 border-b border-amber-200 flex gap-2 overflow-x-auto">
          {speciesList.map((sp) => {
            const info = SPECIES_CATALOG[sp];
            const isSelected = selectedSpecies === sp;
            const hasAdopted = pets.some((p) => p.species === sp && p.isAdopted);

            return (
              <button
                key={sp}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedSpecies(sp);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 font-bold text-xs sm:text-sm border transition cursor-pointer ${
                  isSelected
                    ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                    : hasAdopted
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{info.name}</span>
                {hasAdopted && <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Species Banner */}
          <div className="p-4 bg-white rounded-2xl border-2 border-pink-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold text-gray-800 font-['Fredoka']">
                  {activeSpeciesInfo.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-pink-100 text-pink-700 font-bold text-xs rounded-full">
                  "{activeSpeciesInfo.sound}"
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                {activeSpeciesInfo.description}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 bg-pink-50 p-3 rounded-xl border border-pink-200">
              <div className="flex items-center gap-1.5 text-xs text-pink-800 font-bold">
                <Utensils className="w-4 h-4 text-pink-600" />
                <span>Favorite Treat:</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {activeSpeciesInfo.treatName}
              </span>
            </div>
          </div>

          {/* Unlocked Rewards for this Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-purple-600 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                  Unlocked Costume
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {activeSpeciesInfo.costumeName}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl border border-amber-200 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-amber-600 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                  Unlocked Furniture
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {activeSpeciesInfo.unlockedFurniture}
                </p>
              </div>
            </div>
          </div>

          {/* Living Pets in Sanctuary */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span>Sanctuary Individuals</span>
              <span className="text-xs font-semibold text-pink-600">
                ({adoptedCount} adopted)
              </span>
            </h4>

            {matchingPets.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
                None found in the forest yet! Explore further out in the peaceful meadow.
              </div>
            ) : (
              <div className="space-y-3">
                {matchingPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-800">
                          {pet.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                            pet.variant === 'albino'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : pet.variant === 'melanistic'
                              ? 'bg-slate-800 text-cyan-300'
                              : pet.variant === 'rainbow'
                              ? 'bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800'
                              : pet.variant === 'winged'
                              ? 'bg-sky-100 text-sky-800'
                              : pet.variant === 'celestial'
                              ? 'bg-indigo-900 text-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pet.variant}
                        </span>
                        {pet.isAdopted ? (
                          <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 font-bold rounded-full">
                            Adopted Friend
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 font-semibold rounded-full">
                            Wild
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Personality: <span className="font-medium text-gray-700">{pet.personality}</span>
                      </p>

                      {pet.isAdopted && (
                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-600">
                          <span>Hunger: {pet.care.hunger}%</span>
                          <span>Clean: {pet.care.cleanliness}%</span>
                          <span>Happiness: {pet.care.happiness}%</span>
                        </div>
                      )}
                    </div>

                    {pet.isAdopted && onSelectPetForCare && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onSelectPetForCare(pet);
                        }}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        Care Station 🛁
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-amber-100/60 border-t border-amber-200 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition cursor-pointer"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
