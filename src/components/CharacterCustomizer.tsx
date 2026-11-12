/**
 * Character Customizer Modal for Luisa's Magical Pet Sanctuary
 * Gender, Hair Style, Hair Color, Name, and Unlocked Costumes.
 */

import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, User, Palette, Shirt } from 'lucide-react';
import {
  CostumeId,
  COSTUMES,
  Gender,
  HairColor,
  HAIR_COLORS,
  HairStyle,
  HAIR_STYLES,
  PlayerCustomization,
  SpeciesId,
} from '../game/types';
import { soundManager } from '../game/audio';

interface CharacterCustomizerProps {
  customization: PlayerCustomization;
  unlockedCostumes: Set<CostumeId>;
  onSave: (customization: PlayerCustomization) => void;
  onClose: () => void;
}

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  customization,
  unlockedCostumes,
  onSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'basics' | 'hair' | 'outfit'>('basics');
  const [name, setName] = useState(customization.name);
  const [gender, setGender] = useState<Gender>(customization.gender);
  const [hairColor, setHairColor] = useState<HairColor>(customization.hairColor);
  const [hairStyle, setHairStyle] = useState<HairStyle>(customization.hairStyle);
  const [costume, setCostume] = useState<CostumeId>(customization.costume);

  const handleApply = () => {
    soundManager.playClick();
    onSave({
      name: name.trim() || 'Luisa',
      gender,
      hairColor,
      hairStyle,
      costume,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-pink-50 to-amber-50 rounded-3xl shadow-2xl border-4 border-pink-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-pink-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-full text-pink-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-['Fredoka']">
              Sanctuary Guardian Customizer
            </h2>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-pink-200 bg-white/40 px-6 gap-2 pt-3">
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('basics');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-semibold text-sm border-b-2 transition cursor-pointer ${
              tab === 'basics'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Character & Name</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setTab('hair');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-semibold text-sm border-b-2 transition cursor-pointer ${
              tab === 'hair'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Hair Style & Color</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setTab('outfit');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-semibold text-sm border-b-2 transition cursor-pointer ${
              tab === 'outfit'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Outfits & Costumes</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {tab === 'basics' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Guardian Name
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Guardian Luisa"
                  className="w-full px-4 py-2.5 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 text-gray-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['girl', 'boy'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        soundManager.playClick();
                        setGender(g);
                      }}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-base transition cursor-pointer ${
                        gender === g
                          ? 'bg-pink-100 border-pink-500 text-pink-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-pink-200'
                      }`}
                    >
                      <span>{g === 'girl' ? '👧 Girl Guardian' : '👦 Boy Guardian'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'hair' && (
            <div className="space-y-6">
              {/* Hair Color */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hair Color
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {(Object.keys(HAIR_COLORS) as HairColor[]).map((colorKey) => {
                    const info = HAIR_COLORS[colorKey];
                    const isSelected = hairColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        onClick={() => {
                          soundManager.playClick();
                          setHairColor(colorKey);
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-pink-500 bg-pink-100/60 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-pink-200'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex items-center justify-center mb-1"
                          style={{ backgroundColor: info.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">
                          {info.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hair Style (4 Common Styles per Hair Color)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {HAIR_STYLES.map((style) => {
                    const isSelected = hairStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => {
                          soundManager.playClick();
                          setHairStyle(style.id);
                        }}
                        className={`p-3 rounded-xl border-2 text-left font-bold text-sm transition cursor-pointer ${
                          isSelected
                            ? 'bg-pink-100 border-pink-500 text-pink-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-pink-200'
                        }`}
                      >
                        {style.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'outfit' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-700">
                  Animal-Themed Costumes
                </label>
                <span className="text-xs text-pink-600 font-semibold">
                  Unlocked by Adopting Species!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(COSTUMES) as CostumeId[]).map((cid) => {
                  const info = COSTUMES[cid];
                  const isUnlocked = unlockedCostumes.has(cid) || cid === 'default_adventurer';
                  const isSelected = costume === cid;

                  return (
                    <button
                      key={cid}
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) {
                          soundManager.playClick();
                          setCostume(cid);
                        }
                      }}
                      className={`relative p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                        !isUnlocked
                          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-pink-100 border-pink-500 shadow-md cursor-pointer'
                          : 'bg-white border-gray-200 hover:border-pink-300 cursor-pointer'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: info.color }}
                      >
                        {isUnlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5 text-gray-500" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-gray-800">
                            {info.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-pink-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {isUnlocked ? info.description : 'Adopt this species to unlock!'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/80 border-t border-pink-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-500/20 active:scale-95 transition cursor-pointer"
          >
            Save & Look Fabulous
          </button>
        </div>
      </div>
    </div>
  );
};
