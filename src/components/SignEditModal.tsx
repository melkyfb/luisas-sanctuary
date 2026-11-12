/**
 * Modal to customize wooden pen nameplates in Luisa's Magical Pet Sanctuary
 */

import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../game/audio';

interface SignEditModalProps {
  signData: { id: string; title: string; icon: string };
  onSave: (id: string, newTitle: string, newIcon: string) => void;
  onClose: () => void;
}

const ICONS = ['🐾', '🌸', '⭐', '🦄', '🐶', '🐱', '🐰', '🦊', '🐻', '🥕', '🍓', '💖', '🌈', '🏰'];

export const SignEditModal: React.FC<SignEditModalProps> = ({
  signData,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(signData.title || 'Cercado dos Pets');
  const [icon, setIcon] = useState(signData.icon || '🐾');

  const handleSave = () => {
    soundManager.playPlace();
    onSave(signData.id, title.trim() || 'Cercado dos Pets', icon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪧</span>
            <h2 className="text-lg font-black text-amber-950 font-['Quicksand']">
              Personalizar Placa de Nome
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/40 text-amber-950 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Live Preview Wooden Plaque */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-500 mb-1">Pré-visualização 3D</span>
            <div className="w-64 h-32 bg-[#8d6e63] rounded-2xl p-2.5 shadow-md border-4 border-[#5d4037] flex flex-col items-center justify-center relative">
              {/* Corner brass rivets */}
              <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
              <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
              <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />

              <div className="w-full h-full bg-[#d7ccc8] rounded-xl flex flex-col items-center justify-center p-2 border border-[#8d6e63]/40">
                <span className="text-3xl filter drop-shadow-xs">{icon}</span>
                <span className="font-extrabold text-sm sm:text-base text-[#3e2723] font-['Quicksand'] mt-1 text-center truncate max-w-[90%]">
                  {title || 'Nome do Cercado'}
                </span>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nome do Cercado / Piquete:
            </label>
            <input
              type="text"
              value={title}
              maxLength={22}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Recanto dos Unicórnios..."
              className="w-full px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-bold text-amber-950 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Escolha um Ícone Fofo:
            </label>
            <div className="grid grid-cols-7 gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => {
                    soundManager.playClick();
                    setIcon(ic);
                  }}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 transition active:scale-90 cursor-pointer ${
                    icon === ic
                      ? 'border-amber-500 bg-amber-200 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-amber-300 bg-gray-50'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Placa ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
