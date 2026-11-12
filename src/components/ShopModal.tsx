/**
 * Sanctuary Decor & Furniture Catalog (Cozy Sandbox Mode - All free/unlocked through adoption!)
 */

import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, Lock, Home, Shield } from 'lucide-react';
import { FurnitureItem, SpeciesId } from '../game/types';
import { soundManager } from '../game/audio';

interface ShopModalProps {
  onClose: () => void;
  onSelectBuildItem: (itemType: string) => void;
  adoptedSpecies: Set<SpeciesId>;
  onAddFences: (amount: number) => void;
}

export const SANCTUARY_FURNITURE: FurnitureItem[] = [
  {
    id: 'fence',
    name: 'Pasture Fence Post',
    category: 'fence',
    isUnlocked: true,
    icon: '🪵',
    description: 'Sturdy wooden pasture fence to build custom pens.',
    modelType: 'fence',
  },
  {
    id: 'gate',
    name: 'Sanctuary Swing Gate',
    category: 'fence',
    isUnlocked: true,
    icon: '🚪',
    description: 'Matching pasture gate with gold latch for easy pet visits.',
    modelType: 'gate',
  },
  {
    id: 'cozy_bed',
    name: 'Fluffy Donut Bed',
    category: 'bed',
    isUnlocked: true,
    icon: '🛏️',
    description: 'Soft pastel cushion where tired kittens and puppies curl up.',
    modelType: 'cozy_bed',
  },
  {
    id: 'crystal_bed',
    name: 'Albino Crystal Bed',
    category: 'bed',
    unlockedBySpecies: 'unicorn',
    isUnlocked: false,
    icon: '✨',
    description: 'Luminescent quartz bed that glows with starlight.',
    modelType: 'crystal_bed',
  },
  {
    id: 'scratch_tree',
    name: 'Velvet Cat Tree',
    category: 'toy',
    unlockedBySpecies: 'cat',
    isUnlocked: false,
    icon: '🐾',
    description: 'Multi-level scratching post with plush lookout perch.',
    modelType: 'scratch_tree',
  },
  {
    id: 'water_trough',
    name: 'Fresh Water Basin',
    category: 'feeding',
    isUnlocked: true,
    icon: '💧',
    description: 'Clean sparkling spring water trough for thirsty pets.',
    modelType: 'water_trough',
  },
  {
    id: 'food_bowl',
    name: 'Golden Treat Bowl',
    category: 'feeding',
    isUnlocked: true,
    icon: '🥣',
    description: 'Deep bowl filled with yummy berries and biscuits.',
    modelType: 'food_bowl',
  },
  {
    id: 'play_ball',
    name: 'Bouncy Rubber Ball',
    category: 'toy',
    unlockedBySpecies: 'puppy',
    isUnlocked: false,
    icon: '🎾',
    description: 'Bright pink ball that bounces when pets nudge it.',
    modelType: 'play_ball',
  },
  {
    id: 'flower_patch',
    name: 'Wildflower Cluster',
    category: 'decor',
    isUnlocked: true,
    icon: '🌸',
    description: 'Daisies, tulips, and pastel clovers to beautify the sanctuary.',
    modelType: 'flower_patch',
  },
  {
    id: 'signpost',
    name: 'Placa de Nome',
    category: 'decor',
    isUnlocked: true,
    icon: '🪧',
    description: 'Placa de madeira personalizável para dar nome ao seu cercado!',
    modelType: 'signpost',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  onClose,
  onSelectBuildItem,
  adoptedSpecies,
  onAddFences,
}) => {
  const [filter, setFilter] = useState<'all' | 'fence' | 'bed' | 'toy' | 'decor'>('all');

  const filteredItems = SANCTUARY_FURNITURE.filter((item) => {
    if (filter !== 'all' && item.category !== filter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-emerald-50 via-pink-50 to-amber-50 rounded-3xl shadow-2xl border-4 border-emerald-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-['Fredoka']">
                Sanctuary Workshop & Catalog
              </h2>
              <span className="text-xs text-emerald-700 font-semibold">
                Cozy Mode · Everything is 100% Free!
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

        {/* Free Fence Supply Banner */}
        <div className="px-6 py-3 bg-amber-100/70 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900 font-semibold">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>Need more fences to build large pasture pens?</span>
          </div>
          <button
            onClick={() => {
              soundManager.playPlace();
              onAddFences(50);
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+50 Free Fences</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 px-6 py-3 bg-white/50 border-b border-emerald-100 overflow-x-auto">
          {(['all', 'fence', 'bed', 'toy', 'decor'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setFilter(cat);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Item Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
          {filteredItems.map((item) => {
            const isUnlocked =
              item.isUnlocked ||
              (item.unlockedBySpecies && adoptedSpecies.has(item.unlockedBySpecies));

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-gray-100 border-gray-200 opacity-60'
                    : 'bg-white border-emerald-200 shadow-sm hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-pink-50 rounded-xl border border-pink-100">
                        {item.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-600 capitalize">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {!isUnlocked ? (
                      <span className="p-1.5 bg-gray-200 rounded-full text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        Free
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {item.description}
                  </p>

                  {!isUnlocked && item.unlockedBySpecies && (
                    <span className="text-[11px] text-pink-600 font-semibold block mt-1.5">
                      🔒 Unlocks when you adopt a {item.unlockedBySpecies}!
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) {
                        soundManager.playClick();
                        onSelectBuildItem(item.modelType);
                        onClose();
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      !isUnlocked
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95 cursor-pointer'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select & Place</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/80 border-t border-emerald-200 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition cursor-pointer"
          >
            Done Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
