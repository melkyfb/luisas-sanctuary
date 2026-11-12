/**
 * Interactive Pet Care Modal for Luisa's Magical Pet Sanctuary
 * Feeding, Bathing (soap & bubbles), Brushing, and Shearing/Grooming.
 */

import React, { useState } from 'react';
import { X, Sparkles, Heart, Utensils, Droplets, Scissors } from 'lucide-react';
import { PetData, SPECIES_CATALOG } from '../game/types';
import { soundManager } from '../game/audio';

interface PetCareModalProps {
  pet: PetData;
  onClose: () => void;
  onUpdatePetCare: (petId: string, careUpdate: Partial<PetData['care']>) => void;
}

export const PetCareModal: React.FC<PetCareModalProps> = ({
  pet,
  onClose,
  onUpdatePetCare,
}) => {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [care, setCare] = useState(pet.care);

  const speciesInfo = SPECIES_CATALOG[pet.species];

  const handleFeed = () => {
    soundManager.playFeed();
    setActiveAnimation('eating');
    const newHunger = Math.min(100, care.hunger + 30);
    const newHappy = Math.min(100, care.happiness + 15);
    const updated = { ...care, hunger: newHunger, happiness: newHappy };
    setCare(updated);
    onUpdatePetCare(pet.id, updated);
    setTimeout(() => setActiveAnimation(null), 1200);
  };

  const handleBath = () => {
    soundManager.playBubble();
    setActiveAnimation('bath');

    // Spawn 6 cute bubbles
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
    }));
    setBubbles(newBubbles);

    const newClean = Math.min(100, care.cleanliness + 35);
    const newHappy = Math.min(100, care.happiness + 15);
    const updated = { ...care, cleanliness: newClean, happiness: newHappy };
    setCare(updated);
    onUpdatePetCare(pet.id, updated);
    setTimeout(() => {
      setActiveAnimation(null);
      setBubbles([]);
    }, 1200);
  };

  const handleBrush = () => {
    soundManager.playBrush();
    soundManager.playPet();
    setActiveAnimation('brush');

    const newClean = Math.min(100, care.cleanliness + 20);
    const newHappy = Math.min(100, care.happiness + 25);
    const updated = { ...care, cleanliness: newClean, happiness: newHappy };
    setCare(updated);
    onUpdatePetCare(pet.id, updated);
    setTimeout(() => setActiveAnimation(null), 1200);
  };

  const handleGroom = () => {
    soundManager.playHugCelebration();
    setActiveAnimation('groom');

    const updated = { ...care, groomed: true, happiness: 100 };
    setCare(updated);
    onUpdatePetCare(pet.id, updated);
    setTimeout(() => setActiveAnimation(null), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-sky-50 via-pink-50 to-amber-50 rounded-3xl shadow-2xl border-4 border-pink-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-pink-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-full text-pink-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-['Fredoka']">
                Caring for {pet.name}
              </h2>
              <span className="text-xs text-pink-600 font-semibold uppercase">
                {pet.variant} {speciesInfo.name} · {speciesInfo.sound}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Play & Care Center */}
        <div className="p-6 flex flex-col items-center justify-center relative min-h-[220px]">
          {/* Animated Pet Display Circle */}
          <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-pink-200 via-amber-100 to-sky-200 flex items-center justify-center shadow-inner border-4 border-white">
            <span className="text-5xl select-none animate-bounce">
              {pet.species === 'unicorn'
                ? '🦄'
                : pet.species === 'cat' || pet.species === 'kitten'
                ? '🐱'
                : pet.species === 'dog' || pet.species === 'puppy'
                ? '🐶'
                : pet.species === 'bunny'
                ? '🐰'
                : pet.species === 'fox'
                ? '🦊'
                : '🐻'}
            </span>

            {/* Bubble FX */}
            {bubbles.map((b) => (
              <span
                key={b.id}
                className="absolute text-xl animate-ping"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                🫧
              </span>
            ))}

            {/* Active Action Floating Badge */}
            {activeAnimation && (
              <div className="absolute -top-3 px-3 py-1 bg-white border-2 border-pink-300 rounded-full text-xs font-bold text-pink-600 shadow-md">
                {activeAnimation === 'eating' && 'Munch Munch! 🍓'}
                {activeAnimation === 'bath' && 'Splish Splash! 🫧'}
                {activeAnimation === 'brush' && 'Soft & Shiny Fur! ✨'}
                {activeAnimation === 'groom' && 'Gorgeous Ribbon! 🎀'}
              </div>
            )}
          </div>

          {/* Care Status Gauges */}
          <div className="w-full grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 bg-white/90 rounded-2xl border border-pink-200 text-center shadow-sm">
              <span className="text-xs text-gray-500 font-bold block">Hunger</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${care.hunger}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 mt-1 block">
                {care.hunger}%
              </span>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-pink-200 text-center shadow-sm">
              <span className="text-xs text-gray-500 font-bold block">Cleanliness</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${care.cleanliness}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 mt-1 block">
                {care.cleanliness}%
              </span>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-pink-200 text-center shadow-sm">
              <span className="text-xs text-gray-500 font-bold block">Happiness</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${care.happiness}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 mt-1 block">
                {care.happiness}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Care Tool Buttons */}
        <div className="p-6 bg-white/70 border-t border-pink-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleFeed}
            className="flex flex-col items-center p-3 rounded-2xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Utensils className="w-6 h-6 text-amber-600 mb-1" />
            <span className="font-bold text-xs">Feed Favorite</span>
            <span className="text-[10px] text-amber-700 font-medium">{speciesInfo.treatName}</span>
          </button>

          <button
            onClick={handleBath}
            className="flex flex-col items-center p-3 rounded-2xl bg-sky-100/70 hover:bg-sky-100 text-sky-900 border border-sky-300 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Droplets className="w-6 h-6 text-sky-600 mb-1" />
            <span className="font-bold text-xs">Bubble Bath</span>
            <span className="text-[10px] text-sky-700 font-medium">Soap & Splash</span>
          </button>

          <button
            onClick={handleBrush}
            className="flex flex-col items-center p-3 rounded-2xl bg-pink-100/70 hover:bg-pink-100 text-pink-900 border border-pink-300 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-pink-600 mb-1" />
            <span className="font-bold text-xs">Brush Fur</span>
            <span className="text-[10px] text-pink-700 font-medium">Gentle Shine</span>
          </button>

          <button
            onClick={handleGroom}
            className="flex flex-col items-center p-3 rounded-2xl bg-purple-100/70 hover:bg-purple-100 text-purple-900 border border-purple-300 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Scissors className="w-6 h-6 text-purple-600 mb-1" />
            <span className="font-bold text-xs">Cute Ribbon</span>
            <span className="text-[10px] text-purple-700 font-medium">Max Happiness</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/90 border-t border-pink-200 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm rounded-xl shadow transition cursor-pointer"
          >
            Done Snuggling
          </button>
        </div>
      </div>
    </div>
  );
};
