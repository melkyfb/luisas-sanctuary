/**
 * Adoption Celebration Modal for Luisa's Magical Pet Sanctuary
 * Fires confetti, plays fanfare, allows renaming pet, and showcases unlocked rewards!
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Check, Award, Shirt } from 'lucide-react';
import { PetData, SPECIES_CATALOG } from '../game/types';
import { soundManager } from '../game/audio';

interface AdoptionModalProps {
  pet: PetData;
  onClose: (newName?: string) => void;
}

export const AdoptionModal: React.FC<AdoptionModalProps> = ({ pet, onClose }) => {
  const [petName, setPetName] = useState(pet.name);
  const speciesInfo = SPECIES_CATALOG[pet.species];

  React.useEffect(() => {
    // Fire celebratory pastel confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f48fb1', '#ffd54f', '#81d4fa', '#b388ff', '#a7d97b'],
    });
  }, []);

  const handleFinish = () => {
    soundManager.playClick();
    onClose(petName.trim() || pet.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-pink-50 via-amber-50 to-purple-50 rounded-3xl shadow-2xl border-4 border-pink-300 overflow-hidden flex flex-col p-6 text-center space-y-4">
        {/* Sparkle Header */}
        <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center text-pink-600 shadow-inner">
          <Heart className="w-8 h-8 fill-pink-500 text-pink-500 animate-bounce" />
        </div>

        <div>
          <span className="px-3 py-1 bg-pink-200 text-pink-800 text-xs font-extrabold uppercase rounded-full">
            Special Bond Formed! ✨
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-['Fredoka'] mt-2">
            You Adopted a {speciesInfo.name}!
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            This adorable {pet.variant} friend is now an official member of your magical sanctuary.
          </p>
        </div>

        {/* Rename Input */}
        <div className="bg-white/80 p-3.5 rounded-2xl border border-pink-200 text-left">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Give your new companion a name:
          </label>
          <input
            type="text"
            maxLength={18}
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full px-3.5 py-2 bg-pink-50/50 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-pink-500 text-gray-800 font-bold"
          />
        </div>

        {/* Unlocked Rewards Showcase */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide block">
            Sanctuary Rewards Unlocked:
          </span>

          <div className="p-3 bg-white/90 rounded-xl border border-purple-200 flex items-center gap-3">
            <Shirt className="w-5 h-5 text-purple-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-gray-800 block">{speciesInfo.costumeName}</span>
              <span className="text-gray-500">New Guardian outfit in your closet!</span>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-gray-800 block">{speciesInfo.unlockedFurniture}</span>
              <span className="text-gray-500">Free to place in the Workshop!</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Welcome to the Family!</span>
        </button>
      </div>
    </div>
  );
};
