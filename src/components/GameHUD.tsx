/**
 * Game HUD for Luisa's Magical Pet Sanctuary
 * Built according to Three.js low-occlusion directives:
 * - Unified collapsible bottom dock (100% unobstructed viewport center)
 * - Zero backdrop-filter over active canvas
 * - No pulsating dots
 * - Mobile virtual touch joystick + desktop keyboard/mouse controls
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Heart,
  Hammer,
  RotateCw,
  Trash2,
  Check,
  BookOpen,
  ShoppingBag,
  User,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Compass,
  ZoomIn,
  ZoomOut,
  Utensils,
  Sparkles,
  CloudRain,
  Sun,
  Snowflake,
  Star,
  Camera,
  Trophy,
} from 'lucide-react';
import { PetData, SPECIES_CATALOG, WeatherType } from '../game/types';
import { soundManager } from '../game/audio';

interface GameHUDProps {
  loveCount: number;
  adoptedCount: number;
  totalPets: number;
  timeOfDay: number;
  onAdvanceTimeOfDay?: () => void;
  currentWeather: WeatherType;
  onCycleWeather: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  // Modals
  onOpenBook: () => void;
  onOpenShop: () => void;
  onOpenCustomizer: () => void;
  onOpenPetCare: (pet: PetData) => void;
  // Sanctuary Stars & Quests
  starLevel: number;
  unclaimedQuestsCount: number;
  onOpenSanctuaryStars: () => void;
  // Photo Mode
  onOpenPhotoMode: () => void;
  // Fetch Ball
  onThrowFetchBall: () => void;
  // Signpost Edit
  nearbySignpost: { id: string; title: string; icon: string } | null;
  onOpenSignpostEdit: (sign: { id: string; title: string; icon: string }) => void;
  // Pet interactions
  targetedPet: PetData | null;
  onCallPet: () => void;
  onFeedPet: (petId: string) => void;
  onStrokePet: (petId: string) => void;
  onHugAdoptPet: (petId: string) => void;
  // Magic Wand
  isWandAvailable: boolean;
  onCastWand: () => void;
  // Building
  isBuildMode: boolean;
  onToggleBuildMode: () => void;
  buildTool: 'place' | 'demolish';
  onChangeBuildTool: (tool: 'place' | 'demolish') => void;
  selectedBuildItem: string;
  onRotateBuildItem: () => void;
  onPlaceBuildItem: () => void;
  onRemoveNearestBuildItem: () => void;
  fenceCount: number;
  // Camera Controls
  onRotateCamera: (delta: number) => void;
  onZoomCamera: (delta: number) => void;
  // Joystick input for mobile touch
  onJoystickMove: (vec: { x: number; y: number }) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  loveCount,
  adoptedCount,
  totalPets,
  timeOfDay,
  onAdvanceTimeOfDay,
  currentWeather,
  onCycleWeather,
  isMuted,
  onToggleMute,
  onOpenBook,
  onOpenShop,
  onOpenCustomizer,
  onOpenPetCare,
  starLevel,
  unclaimedQuestsCount,
  onOpenSanctuaryStars,
  onOpenPhotoMode,
  onThrowFetchBall,
  nearbySignpost,
  onOpenSignpostEdit,
  targetedPet,
  onCallPet,
  onFeedPet,
  onStrokePet,
  onHugAdoptPet,
  isWandAvailable,
  onCastWand,
  isBuildMode,
  onToggleBuildMode,
  buildTool,
  onChangeBuildTool,
  selectedBuildItem,
  onRotateBuildItem,
  onPlaceBuildItem,
  onRemoveNearestBuildItem,
  fenceCount,
  onRotateCamera,
  onZoomCamera,
  onJoystickMove,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Time of Day label & icon
  const getTimeLabel = () => {
    if (timeOfDay >= 6 && timeOfDay < 12) return 'Morning ☀️';
    if (timeOfDay >= 12 && timeOfDay < 17) return 'Afternoon 🌤️';
    if (timeOfDay >= 17 && timeOfDay < 20) return 'Golden Sunset 🌅';
    return 'Starlit Night 🌙';
  };

  // Virtual Touch Joystick handlers (Mobile support)
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setJoystickActive(true);
    handleJoystickTouchMove(e);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current) return;
    const touch = e.touches[0];
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxR = 38;

    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: knobX, y: knobY });
    onJoystickMove({ x: knobX / maxR, y: knobY / maxR });
  };

  const handleJoystickTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Top Header Status Bar */}
      <div className="flex items-start justify-between w-full max-w-6xl mx-auto gap-2">
        {/* Left: Sanctuary Love & Adopted Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
          {/* Love Points */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-pink-200 rounded-full shadow-sm text-pink-700 font-bold text-sm">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="tabular-nums font-mono text-base">{loveCount}</span>
            <span className="text-xs text-pink-600 font-semibold">Love</span>
          </div>

          {/* Adopted Count */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-amber-200 rounded-full shadow-sm text-amber-900 font-bold text-sm">
            <span className="text-base">🐾</span>
            <span className="tabular-nums font-mono text-base">{adoptedCount}</span>
            <span className="text-xs text-amber-700 font-semibold">Adopted ({totalPets} in wild)</span>
          </div>
        </div>

        {/* Center / Right: Clock, Tools & Navigation Modals */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time Badge (Clickable to advance time of day) */}
          <button
            onClick={onAdvanceTimeOfDay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-sky-50 border border-sky-200 rounded-full text-xs font-bold text-sky-800 shadow-sm transition active:scale-95 cursor-pointer"
            title="Click to advance time: Morning ☀️, Afternoon 🌤️, Sunset 🌅, Night 🌙"
          >
            <span>{getTimeLabel()}</span>
          </button>

          {/* Interactive Weather Pill (Cycles sunny, light rain, snow) */}
          <button
            onClick={onCycleWeather}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition active:scale-95 cursor-pointer ${
              currentWeather === 'sunny'
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                : currentWeather === 'rainy'
                ? 'bg-sky-100/90 text-sky-900 border-sky-300 hover:bg-sky-200'
                : 'bg-indigo-100/90 text-indigo-900 border-indigo-300 hover:bg-indigo-200'
            }`}
            title="Click to change weather: Sunny ☀️, Light Rain 🌧️, Gentle Snow ❄️"
          >
            {currentWeather === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-600" />}
            {currentWeather === 'rainy' && <CloudRain className="w-3.5 h-3.5 text-sky-600" />}
            {currentWeather === 'snowy' && <Snowflake className="w-3.5 h-3.5 text-indigo-600" />}
            <span className="capitalize">{currentWeather}</span>
          </button>

          {/* Sanctuary Stars & Quests */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSanctuaryStars();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 border-2 border-amber-300 rounded-2xl text-amber-950 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer relative"
            title="Nível de Estrelas do Santuário & Missões"
          >
            <Trophy className="w-4 h-4 text-amber-900" />
            <span>Nível {starLevel} ★</span>
            {unclaimedQuestsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-rose-500 text-white font-extrabold text-[10px] rounded-full shadow-xs animate-bounce">
                {unclaimedQuestsCount}
              </span>
            )}
          </button>

          {/* Photo Mode */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPhotoMode();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white border-2 border-rose-200 rounded-2xl text-rose-800 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Modo Foto & Álbum de Lembranças"
          >
            <Camera className="w-4 h-4 text-rose-500" />
            <span className="hidden lg:inline">Modo Foto</span>
          </button>

          {/* Book / Journal */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenBook();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white border-2 border-amber-200 rounded-2xl text-amber-800 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Sanctuary Pet Journal"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Pet Book</span>
          </button>

          {/* Workshop / Shop */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white border-2 border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Sanctuary Furniture & Fences"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Workshop</span>
          </button>

          {/* Character Avatar */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCustomizer();
            }}
            className="p-2 bg-white/95 hover:bg-white border-2 border-purple-200 rounded-2xl text-purple-700 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title="Customize Avatar"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-white/95 hover:bg-white border-2 border-gray-200 rounded-2xl text-gray-600 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-pink-600" />}
          </button>
        </div>
      </div>

      {/* Middle Screen Floaters: Mobile Joystick & Camera Controls */}
      <div className="flex items-end justify-between w-full pointer-events-none mb-4">
        {/* Mobile Virtual Joystick (Left flank) */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className="pointer-events-auto relative w-28 h-28 rounded-full bg-white/60 border-2 border-pink-300 shadow-lg flex items-center justify-center touch-none sm:hidden"
        >
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transition-transform"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          >
            🐾
          </div>
        </div>

        {/* Right Camera Controls (Orbit & Zoom) */}
        <div className="flex flex-col gap-2 pointer-events-auto ml-auto">
          <div className="flex flex-col gap-1.5 p-1.5 bg-white/90 border border-pink-200 rounded-2xl shadow-sm">
            <button
              onClick={() => onRotateCamera(-0.25)}
              className="p-2 hover:bg-pink-100 rounded-xl text-gray-700 transition cursor-pointer"
              title="Rotate Camera Left"
            >
              <Compass className="w-4 h-4 text-pink-600 -rotate-45" />
            </button>
            <button
              onClick={() => onRotateCamera(0.25)}
              className="p-2 hover:bg-pink-100 rounded-xl text-gray-700 transition cursor-pointer"
              title="Rotate Camera Right"
            >
              <Compass className="w-4 h-4 text-pink-600 rotate-45" />
            </button>
            <div className="h-px bg-pink-100 my-0.5" />
            <button
              onClick={() => onZoomCamera(-2.5)}
              className="p-2 hover:bg-pink-100 rounded-xl text-gray-700 transition cursor-pointer"
              title="Zoom In (Close to pet)"
            >
              <ZoomIn className="w-4 h-4 text-pink-600" />
            </button>
            <button
              onClick={() => onZoomCamera(2.5)}
              className="p-2 hover:bg-pink-100 rounded-xl text-gray-700 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-pink-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Bottom Control Dock (Consolidated per Three.js directives) */}
      <div className="flex flex-col items-center pointer-events-auto w-full max-w-3xl mx-auto">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            setIsDockCollapsed(!isDockCollapsed);
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 mb-1.5 bg-white/90 hover:bg-white text-gray-600 border border-pink-200 rounded-full text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-pink-600" />
              <span>Show Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-pink-600" />
              <span>Hide Controls (H)</span>
            </>
          )}
        </button>

        {/* Collapsible Dock Drawer */}
        {!isDockCollapsed && (
          <div className="w-full bg-white/95 rounded-3xl border-2 border-pink-200 shadow-xl p-3 sm:p-4 flex flex-col gap-3">
            {/* Contextual Pet Interaction Banner (Appears when near any pet) */}
            {targetedPet && (
              <div className="p-3 bg-gradient-to-r from-pink-100 via-rose-50 to-amber-100 rounded-2xl border border-pink-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-white rounded-xl shadow-sm">
                    {targetedPet.species === 'unicorn'
                      ? '🦄'
                      : targetedPet.species === 'cat' || targetedPet.species === 'kitten'
                      ? '🐱'
                      : targetedPet.species === 'dog' || targetedPet.species === 'puppy'
                      ? '🐶'
                      : targetedPet.species === 'bunny'
                      ? '🐰'
                      : targetedPet.species === 'fox'
                      ? '🦊'
                      : '🐻'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-800">
                        {targetedPet.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-pink-200 text-pink-800 rounded-full">
                        {targetedPet.variant}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 block">
                      {targetedPet.isAdopted
                        ? 'Sanctuary Friend · Ready for love'
                        : `Wild Pet · Taming Stage ${targetedPet.tameStage}/4`}
                    </span>
                    <span className="text-[11px] font-semibold text-pink-700 block">
                      {currentWeather === 'sunny' && '☀️ Active & energetic tail wagging'}
                      {currentWeather === 'rainy' && '🌧️ Shaking raindrops, staying cozy'}
                      {currentWeather === 'snowy' && '❄️ High bouncy snow hops'}
                    </span>
                  </div>
                </div>

                {/* Taming Steps / Care Buttons */}
                <div className="flex items-center gap-2">
                  {!targetedPet.isAdopted ? (
                    <>
                      {targetedPet.tameStage === 0 && (
                        <button
                          onClick={onCallPet}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
                        >
                          1. Call Pet 📢
                        </button>
                      )}
                      {targetedPet.tameStage === 1 && (
                        <button
                          onClick={() => onFeedPet(targetedPet.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>2. Offer Treat 🍓</span>
                        </button>
                      )}
                      {targetedPet.tameStage === 2 && (
                        <button
                          onClick={() => onStrokePet(targetedPet.id)}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>3. Pet Gently 💖</span>
                        </button>
                      )}
                      {targetedPet.tameStage === 3 && (
                        <button
                          onClick={() => onHugAdoptPet(targetedPet.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>4. Hug & Adopt! 🧸</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStrokePet(targetedPet.id)}
                        className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Pet</span>
                      </button>
                      <button
                        onClick={() => onOpenPetCare(targetedPet)}
                        className="px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
                      >
                        Care Station 🛁
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Row: Call, Wand, Build Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Call Whistle Action */}
              <button
                onClick={onCallPet}
                className="flex items-center gap-2 px-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold text-xs sm:text-sm rounded-2xl border border-pink-300 shadow-sm transition active:scale-95 cursor-pointer"
                title="Chamar bichinhos próximos com assobio fofo"
              >
                <span>📢 Chamar Pet (Espaço)</span>
              </button>

              {/* Fetch Toy Ball Action */}
              <button
                onClick={onThrowFetchBall}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 text-orange-950 font-bold text-xs sm:text-sm rounded-2xl border border-orange-300 shadow-sm transition active:scale-95 cursor-pointer"
                title="Jogar a bolinha de borracha para os pets buscarem! (Tecla B)"
              >
                <span>🎾 Jogar Bolinha (B)</span>
              </button>

              {/* Nearby Signpost Edit Button */}
              {nearbySignpost && (
                <button
                  onClick={() => onOpenSignpostEdit(nearbySignpost)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-2xl border-2 border-amber-500 shadow-md transition active:scale-95 cursor-pointer animate-pulse"
                  title="Personalizar nome e ícone desta placa de cercado"
                >
                  <span>🪧 Placa: {nearbySignpost.title} ✏️</span>
                </button>
              )}

              {/* Daily Magic Wand (Bonus System) */}
              <button
                onClick={onCastWand}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border shadow-sm transition active:scale-95 cursor-pointer ${
                  isWandAvailable
                    ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 text-white border-amber-300 shadow-md hover:scale-105'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
                title="Varinha Mágica Diária: Encanta instantaneamente 1 animal selvagem com 1 clique!"
              >
                <Wand2 className="w-4 h-4" />
                <span>Varinha Mágica ✨</span>
                {isWandAvailable && (
                  <span className="px-1.5 py-0.5 bg-white text-pink-700 text-[10px] rounded-full font-bold">
                    Pronta
                  </span>
                )}
              </button>

              {/* Build Mode Toggle */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleBuildMode();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border transition active:scale-95 cursor-pointer ${
                  isBuildMode
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 shadow-sm'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span>{isBuildMode ? 'Exit Build Mode' : 'Build & Fence 🔨'}</span>
              </button>
            </div>

            {/* Build Mode Sub-Dock (Only shown when Build Mode is active) */}
            {isBuildMode && (
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Tool selection: Place vs Demolish */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onChangeBuildTool('place');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        buildTool === 'place'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Colocar / Pintar</span>
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onChangeBuildTool('demolish');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        buildTool === 'demolish'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Demolir (Reembolsa)</span>
                    </button>
                  </div>

                  {/* Item info & Fences left */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">
                      Item: <span className="text-emerald-700 uppercase font-mono">{selectedBuildItem}</span>
                    </span>
                    {selectedBuildItem === 'fence' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                        {fenceCount} cercas no inventário
                      </span>
                    )}
                  </div>

                  {/* Actions: Rotate & Place */}
                  <div className="flex items-center gap-2">
                    {/* Rotate */}
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onRotateBuildItem();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                      title="Girar 90 graus (Atalho: Tecla R)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Girar (R)</span>
                    </button>

                    {/* Quick remove nearest */}
                    <button
                      onClick={onRemoveNearestBuildItem}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl transition cursor-pointer"
                      title="Desmanchar objeto mais próximo e reembolsar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Manual Place Item Button */}
                    {buildTool === 'place' && (
                      <button
                        onClick={onPlaceBuildItem}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Colocar Peça</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Helpful Instruction Banner */}
                <div className="text-[11px] font-medium text-gray-600 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
                  {buildTool === 'place' ? (
                    <span>
                      🖱️ <strong>Dica de Construção:</strong> Clique e arraste o mouse pelo gramado para criar cercas contínuas! Pressione <strong>R</strong> para girar a cerca e <strong>X</strong> para alternar ferramentas.
                    </span>
                  ) : (
                    <span className="text-rose-700">
                      🪓 <strong>Modo Demolição Ativo:</strong> Clique com o mouse em qualquer cerca colocada para desmanchá-la e devolver +1 cerca ao seu inventário!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
