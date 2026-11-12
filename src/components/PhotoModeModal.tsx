/**
 * Photo Mode & Scrapbook Memory Album for Luisa's Magical Pet Sanctuary
 */

import React, { useState } from 'react';
import {
  Camera,
  X,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Download,
  Trash2,
  Check,
  RotateCw,
} from 'lucide-react';
import { PhotoMemory } from '../game/types';
import { soundManager } from '../game/audio';

interface PhotoModeModalProps {
  onCapture: (filter: string, caption: string, stickers: string[]) => { dataUrl: string; petsInView: string[] };
  onSavePhoto: (photo: PhotoMemory) => void;
  savedPhotos: PhotoMemory[];
  onDeletePhoto: (id: string) => void;
  onClose: () => void;
}

const FILTERS = [
  { id: 'normal', name: 'Natural', css: 'none' },
  { id: 'polaroid', name: 'Polaroid', css: 'sepia(30%) saturate(120%) contrast(105%)' },
  { id: 'pastel', name: 'Pastel', css: 'brightness(108%) saturate(130%) hue-rotate(10deg)' },
  { id: 'sunset', name: 'Dourado', css: 'sepia(45%) saturate(140%) brightness(105%)' },
  { id: 'starlight', name: 'Estrelar', css: 'contrast(115%) brightness(110%) hue-rotate(-15deg)' },
];

const AVAILABLE_STICKERS = ['💖', '🐾', '⭐', '🌸', '✨', '🌈', '🧸'];

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  onCapture,
  onSavePhoto,
  savedPhotos,
  onDeletePhoto,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'album'>('camera');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['💖', '🐾']);
  const [caption, setCaption] = useState('Melhores Amigos! 💖');
  const [flashActive, setFlashActive] = useState(false);
  const [lastCaptured, setLastCaptured] = useState<{
    dataUrl: string;
    petsInView: string[];
    caption: string;
  } | null>(null);

  const toggleSticker = (sticker: string) => {
    soundManager.playClick();
    setSelectedStickers((prev) =>
      prev.includes(sticker) ? prev.filter((s) => s !== sticker) : [...prev, sticker]
    );
  };

  const handleTakePhoto = () => {
    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 220);

    const result = onCapture(selectedFilter, caption, selectedStickers);
    setLastCaptured({
      dataUrl: result.dataUrl,
      petsInView: result.petsInView,
      caption,
    });

    // Save to album automatically
    const newMemory: PhotoMemory = {
      id: `photo_${Date.now()}`,
      dataUrl: result.dataUrl,
      timestamp: Date.now(),
      caption: caption || 'Lembrança do Santuário 🌸',
      filter: selectedFilter,
      stickers: [...selectedStickers],
      petsCaptured: result.petsInView,
    };
    onSavePhoto(newMemory);
  };

  const handleDownload = (dataUrl: string, filename: string) => {
    soundManager.playClick();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs select-none">
      {/* Flash overlay animation */}
      {flashActive && <div className="fixed inset-0 z-[60] bg-white transition-opacity duration-150 pointer-events-none" />}

      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-pink-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 flex items-center justify-between border-b-2 border-pink-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/80 rounded-2xl shadow-xs text-pink-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-rose-950 font-['Quicksand']">
                Modo Foto & Álbum de Lembranças
              </h2>
              <p className="text-[11px] font-semibold text-rose-900">
                Tire fotos mágicas dos bichinhos e guarde no seu álbum!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs Switcher */}
            <div className="flex items-center bg-white/80 p-1 rounded-2xl border border-pink-200 text-xs font-bold">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('camera');
                }}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-gray-700 hover:text-rose-600'
                }`}
              >
                Câmera 📸
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('album');
                }}
                className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'album'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-gray-700 hover:text-rose-600'
                }`}
              >
                <span>Álbum</span>
                <span className="px-1.5 py-0.2 bg-white/40 rounded-full text-[10px]">
                  {savedPhotos.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/40 text-rose-950 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Camera Viewfinder & Controls */}
        {activeTab === 'camera' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Camera Viewfinder Preview */}
            <div className="relative w-full aspect-16/10 bg-slate-900 rounded-2xl overflow-hidden border-4 border-amber-100 shadow-inner flex items-center justify-center">
              {/* If just captured, show snapshot preview; otherwise show ready viewfinder frame */}
              {lastCaptured ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img
                    src={lastCaptured.dataUrl}
                    alt="Captured snapshot"
                    className="w-full h-full object-cover"
                    style={{
                      filter: FILTERS.find((f) => f.id === selectedFilter)?.css,
                    }}
                  />
                  {/* Overlay stickers */}
                  <div className="absolute top-3 left-3 flex gap-1.5 text-2xl drop-shadow-md">
                    {selectedStickers.map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  {/* Polaroid caption badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/95 rounded-full shadow-md text-xs font-bold text-gray-800 font-['Quicksand'] max-w-[90%] truncate">
                    {lastCaptured.caption}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/90 bg-gradient-to-br from-sky-900/60 to-purple-900/60">
                  {/* Viewfinder Target Brackets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/80" />

                  {/* Center reticle */}
                  <div className="w-16 h-16 border border-white/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-ping" />
                  </div>

                  <p className="mt-3 text-xs font-bold text-pink-200">
                    Enquadre os pets na tela 3D e clique no botão abaixo para tirar a foto!
                  </p>
                </div>
              )}
            </div>

            {/* Filter Selector */}
            <div>
              <span className="block text-xs font-bold text-gray-700 mb-1.5">
                Filtros Mágicos:
              </span>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedFilter(f.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedFilter === f.id
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stickers Selector */}
            <div>
              <span className="block text-xs font-bold text-gray-700 mb-1.5">
                Adesivos Fofos na Foto:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_STICKERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSticker(s)}
                    className={`w-9 h-9 text-lg flex items-center justify-center rounded-xl border-2 transition cursor-pointer ${
                      selectedStickers.includes(s)
                        ? 'border-pink-500 bg-pink-100 shadow-xs scale-105'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 opacity-60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Legenda da Lembrança:
              </label>
              <input
                type="text"
                value={caption}
                maxLength={36}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva uma legenda fofa..."
                className="w-full px-3.5 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-xl text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:border-pink-400 focus:bg-white"
              />
            </div>

            {/* Take Photo Action Button */}
            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={handleTakePhoto}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:scale-105 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Tirar Foto! 📸 (+25 Love)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scrapbook Album */}
        {activeTab === 'album' && (
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[70vh]">
            {savedPhotos.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
                <ImageIcon className="w-12 h-12 text-pink-300 mb-2" />
                <h3 className="text-base font-bold text-gray-700">Seu Álbum está Vazio</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Vá até a aba "Câmera" e tire suas primeiras fotos dos bichinhos brincando no santuário!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-2.5 shadow-sm flex flex-col justify-between"
                  >
                    {/* Photo with frame */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-black mb-2 shadow-inner">
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                        style={{
                          filter: FILTERS.find((f) => f.id === photo.filter)?.css,
                        }}
                      />
                      {/* Stickers */}
                      <div className="absolute top-2 left-2 flex gap-1 text-lg drop-shadow-sm">
                        {photo.stickers.map((stk, i) => (
                          <span key={i}>{stk}</span>
                        ))}
                      </div>
                    </div>

                    {/* Caption & details */}
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-800 truncate font-['Quicksand']">
                        {photo.caption}
                      </h4>
                      {photo.petsCaptured.length > 0 && (
                        <p className="text-[10px] text-pink-700 font-semibold truncate">
                          🐾 Com: {photo.petsCaptured.join(', ')}
                        </p>
                      )}
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {new Date(photo.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-amber-200/60">
                      <button
                        onClick={() => handleDownload(photo.dataUrl, `santuario_${photo.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                        title="Baixar imagem no computador"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar</span>
                      </button>
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onDeletePhoto(photo.id);
                        }}
                        className="p-1 bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 rounded-lg text-xs transition cursor-pointer"
                        title="Excluir foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
