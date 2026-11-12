/**
 * Sanctuary Star Rating (1-5 Stars) & Cozy Daily Quests Modal
 */

import React, { useState } from 'react';
import {
  Star,
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  Gift,
  Heart,
  Award,
  Crown,
} from 'lucide-react';
import { SanctuaryQuest } from '../game/types';
import { soundManager } from '../game/audio';

interface SanctuaryStarsModalProps {
  starLevel: number;
  starPoints: number;
  quests: SanctuaryQuest[];
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

const STAR_TITLES = [
  'Refúgio Escondido',
  'Prado Acolhedor',
  'Jardim Encantado',
  'Paraíso dos Bichinhos',
  'Santuário Mágico Lendário ✨',
];

const STAR_THRESHOLDS = [0, 100, 250, 450, 700];

export const SanctuaryStarsModal: React.FC<SanctuaryStarsModalProps> = ({
  starLevel,
  starPoints,
  quests,
  onClaimQuest,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'rewards'>('quests');

  // Calculate progress to next star
  const nextThreshold = starLevel < 5 ? STAR_THRESHOLDS[starLevel] : STAR_THRESHOLDS[4];
  const currentThreshold = STAR_THRESHOLDS[starLevel - 1] || 0;
  const progressPercent =
    starLevel >= 5
      ? 100
      : Math.min(
          100,
          Math.max(0, ((starPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
        );

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const unclaimedCount = quests.filter((q) => q.isCompleted && !q.isClaimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 border-b-2 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/80 rounded-2xl shadow-xs text-amber-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 font-['Quicksand']">
                Estrelas do Santuário & Missões
              </h2>
              <p className="text-[11px] font-bold text-amber-900">
                Nível {starLevel} de 5 · {STAR_TITLES[starLevel - 1]}
              </p>
            </div>
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

        {/* Top 5-Star Banner */}
        <div className="p-4 bg-gradient-to-b from-amber-50 to-white border-b border-amber-100 flex flex-col items-center">
          {/* Big Golden Stars */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${
                  s <= starLevel
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md scale-110'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Progress bar to next star */}
          <div className="w-full max-w-xs bg-gray-200 h-3 rounded-full overflow-hidden p-0.5 border border-amber-200 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-amber-800 mt-1">
            {starLevel >= 5
              ? '✨ Nível Máximo de Estrelas Alcançado!'
              : `${starPoints} / ${nextThreshold} Pontos de Estrela`}
          </span>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('quests');
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'quests'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <span>Missões Aconchegantes</span>
              {unclaimedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] animate-bounce">
                  {unclaimedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('rewards');
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rewards'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Recompensas & Títulos</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Quests List */}
        {activeTab === 'quests' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 max-h-[55vh]">
            {quests.map((q) => {
              const progressRatio = Math.min(1, q.currentCount / q.targetCount);

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                    q.isClaimed
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : q.isCompleted
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-white border-gray-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl sm:text-3xl p-1.5 bg-amber-100 rounded-xl">
                      {q.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-gray-800">
                          {q.title}
                        </h4>
                        <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-pink-600" />
                          <span>+{q.rewardLove}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{q.description}</p>

                      {/* Small progress meter */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-28 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${progressRatio * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 font-mono">
                          {Math.min(q.currentCount, q.targetCount)} / {q.targetCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div>
                    {q.isClaimed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1.5 bg-emerald-100 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Coletado</span>
                      </span>
                    ) : q.isCompleted ? (
                      <button
                        onClick={() => onClaimQuest(q.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Coletar! 🎁</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 px-2 py-1 bg-gray-100 rounded-xl">
                        Em progresso
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Star Rewards & Perks */}
        {activeTab === 'rewards' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 max-h-[55vh]">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Desbloqueios de Estrelas:
                </h4>
                <p className="text-[11px] text-amber-800">
                  Suba de nível cumprindo as missões diárias para desbloquear roupas lendárias e decorações!
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">⭐ Nível 1: Refúgio Escondido</span>
                  <span className="text-gray-500 text-[11px]">Início da jornada + 50 cercas livres.</span>
                </div>
                <span className="text-emerald-700 font-bold">Ativo ✓</span>
              </div>

              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">⭐⭐ Nível 2: Prado Acolhedor</span>
                  <span className="text-gray-500 text-[11px]">Traje Aventureiro Dourado + +30 Cercas grátis.</span>
                </div>
                {starLevel >= 2 ? (
                  <span className="text-emerald-700 font-bold">Desbloqueado ✓</span>
                ) : (
                  <span className="text-gray-400 font-bold">Bloqueado 🔒</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">⭐⭐⭐ Nível 3: Jardim Encantado</span>
                  <span className="text-gray-500 text-[11px]">Bebedouro de Cristal com Água Encantada no Workshop.</span>
                </div>
                {starLevel >= 3 ? (
                  <span className="text-emerald-700 font-bold">Desbloqueado ✓</span>
                ) : (
                  <span className="text-gray-400 font-bold">Bloqueado 🔒</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">⭐⭐⭐⭐ Nível 4: Paraíso dos Bichinhos</span>
                  <span className="text-gray-500 text-[11px]">Cama Celestial de Nuvem para descanso dos pets.</span>
                </div>
                {starLevel >= 4 ? (
                  <span className="text-emerald-700 font-bold">Desbloqueado ✓</span>
                ) : (
                  <span className="text-gray-400 font-bold">Bloqueado 🔒</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">⭐⭐⭐⭐⭐ Nível 5: Santuário Mágico Lendário</span>
                  <span className="text-gray-500 text-[11px]">Coroa Real da Guardiã da Natureza para Luisa! 👑</span>
                </div>
                {starLevel >= 5 ? (
                  <span className="text-emerald-700 font-bold">Desbloqueado ✓</span>
                ) : (
                  <span className="text-gray-400 font-bold">Bloqueado 🔒</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
