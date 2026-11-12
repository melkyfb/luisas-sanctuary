/**
 * Full-viewport Title Screen for Luisa's Magical Pet Sanctuary
 * Bespoke title lockup, Start CTA, Character Customizer entry, and flat controls hint.
 */

import React from 'react';
import { Sparkles, Heart, Wand2, User, Play, Volume2, VolumeX } from 'lucide-react';
import { PlayerCustomization } from '../game/types';
import { soundManager } from '../game/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCustomizer: () => void;
  playerCustomization: PlayerCustomization;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCustomizer,
  playerCustomization,
  isMuted,
  onToggleMute,
}) => {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 pointer-events-auto bg-gradient-to-b from-sky-400/20 via-transparent to-emerald-900/30 select-none">
      {/* Top Bar with sound and character badge */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-pink-200 shadow-sm rounded-full text-pink-700 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>Cozy Sandbox Mode · 100% Peaceful</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-3 bg-white/85 hover:bg-white border border-pink-200 rounded-full text-pink-700 shadow-sm transition active:scale-95 cursor-pointer"
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-pink-600" />}
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto my-auto space-y-4">
        {/* Cute Mascot Badges */}
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-pink-500/15 border border-pink-300/60 rounded-full text-pink-800 font-bold text-base shadow-sm">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          <span>Welcome, Guardian {playerCustomization.name}!</span>
          <Wand2 className="w-4 h-4 text-amber-500" />
        </div>

        {/* Bespoke Title Lockup */}
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_12px_rgba(219,39,119,0.7)] font-['Fredoka']">
            Luisa's Magical
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Pet Sanctuary
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-white/95 drop-shadow font-medium max-w-xl">
          Tame wild kittens, puppies, albino unicorns, and friendly bears. Build cozy pens, brush their soft coats, and decorate your magical haven!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame();
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-xl font-bold rounded-full shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Enter Sanctuary</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCustomizer();
            }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/90 hover:bg-white text-purple-700 text-base font-bold rounded-full border-2 border-purple-200 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <User className="w-5 h-5 text-purple-600" />
            <span>Customize Avatar</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="inline-block px-5 py-2.5 bg-black/40 border border-white/20 rounded-full text-white/90 text-xs sm:text-sm font-medium tracking-wide">
          WASD / Arrow Keys Move · Space / Click Interact · Right-Click Drag Orbit Camera · Scroll Wheel Zoom
        </div>
      </div>
    </div>
  );
};
