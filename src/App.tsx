/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import {
  CostumeId,
  PetData,
  PhotoMemory,
  PlayerCustomization,
  SanctuaryQuest,
  SpeciesId,
  SPECIES_CATALOG,
  WeatherType,
} from './game/types';
import { petManager } from './game/PetAI';
import { buildingSystem } from './game/BuildingSystem';
import { soundManager } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { CharacterCustomizer } from './components/CharacterCustomizer';
import { PetBookModal } from './components/PetBookModal';
import { PetCareModal } from './components/PetCareModal';
import { ShopModal } from './components/ShopModal';
import { AdoptionModal } from './components/AdoptionModal';
import { PhotoModeModal } from './components/PhotoModeModal';
import { SignEditModal } from './components/SignEditModal';
import { SanctuaryStarsModal } from './components/SanctuaryStarsModal';

const INITIAL_QUESTS: SanctuaryQuest[] = [
  {
    id: 'adopt_first',
    title: 'Primeira Adoção Mágica',
    description: 'Adote pelo menos 1 pet selvagem para o santuário.',
    icon: '🐾',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 50,
    starContribution: 60,
  },
  {
    id: 'fetch_ball',
    title: 'Hora de Brincar!',
    description: 'Jogue a bolinha para um pet adotado buscar.',
    icon: '🎾',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 40,
    starContribution: 50,
  },
  {
    id: 'photo_shoot',
    title: 'Momento Especial',
    description: 'Tire uma foto no Modo Foto com os bichinhos.',
    icon: '📸',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 40,
    starContribution: 50,
  },
  {
    id: 'build_pen',
    title: 'Arquiteto do Santuário',
    description: 'Coloque 6 ou mais cercas para montar piquetes.',
    icon: '🔨',
    targetCount: 6,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 60,
    starContribution: 70,
  },
  {
    id: 'name_sign',
    title: 'Identidade do Lar',
    description: 'Coloque e personalize uma Placa de Nome no cercado.',
    icon: '🪧',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 45,
    starContribution: 50,
  },
  {
    id: 'care_station',
    title: 'Dia de Carinho',
    description: 'Alimente ou faça carinho em um pet para deixá-lo feliz.',
    icon: '💖',
    targetCount: 3,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 50,
    starContribution: 60,
  },
  {
    id: 'magic_wand',
    title: 'Toque da Varinha Mágica',
    description: 'Use a Varinha Mágica Diária para encantar um animal.',
    icon: '✨',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardLove: 75,
    starContribution: 80,
  },
];

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game Flow State
  const [gameState, setGameState] = useState<'TITLE_SCREEN' | 'PLAYING'>('TITLE_SCREEN');

  // Player Customization
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomization>({
    name: 'Luisa',
    gender: 'girl',
    hairColor: 'dark_brown',
    hairStyle: 'pigtails',
    costume: 'default_adventurer',
  });

  // Sanctuary Progression
  const [loveCount, setLoveCount] = useState(50);
  const [unlockedCostumes, setUnlockedCostumes] = useState<Set<CostumeId>>(
    new Set(['default_adventurer', 'puppy_shirt', 'kitten_overalls'])
  );
  const [adoptedSpecies, setAdoptedSpecies] = useState<Set<SpeciesId>>(
    new Set(['puppy', 'kitten'])
  );

  // Modals & Panels
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPetBook, setShowPetBook] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showPhotoMode, setShowPhotoMode] = useState(false);
  const [showSanctuaryStars, setShowSanctuaryStars] = useState(false);
  const [petInCareStation, setPetInCareStation] = useState<PetData | null>(null);
  const [newlyAdoptedPet, setNewlyAdoptedPet] = useState<PetData | null>(null);
  const [editingSignpost, setEditingSignpost] = useState<{ id: string; title: string; icon: string } | null>(null);
  const [nearbySignpost, setNearbySignpost] = useState<{ id: string; title: string; icon: string } | null>(null);

  // Sanctuary Stars & Quests
  const [starLevel, setStarLevel] = useState(1);
  const [starPoints, setStarPoints] = useState(0);
  const [quests, setQuests] = useState<SanctuaryQuest[]>(INITIAL_QUESTS);

  // Photo Album Memories
  const [savedPhotos, setSavedPhotos] = useState<PhotoMemory[]>([]);

  // HUD Real-time Values
  const [targetedPet, setTargetedPet] = useState<PetData | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  const [isWandAvailable, setIsWandAvailable] = useState(true);
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [buildTool, setBuildTool] = useState<'place' | 'demolish'>('place');
  const [selectedBuildItem, setSelectedBuildItem] = useState('fence');
  const [fenceCount, setFenceCount] = useState(50);
  const [timeOfDay, setTimeOfDay] = useState(10);
  const [isMuted, setIsMuted] = useState(false);

  // 1. Initialize WebGL Three.js Engine once on mount
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const engine = new GameEngine(canvasContainerRef.current);
    engineRef.current = engine;

    engine.onPetSelected = (pet) => {
      setTargetedPet(pet ? { ...pet } : null);
    };

    engine.onLoveGained = (amount) => {
      setLoveCount((prev) => prev + amount);
    };

    engine.onAdoptSuccess = (pet) => {
      setNewlyAdoptedPet({ ...pet });
      setAdoptedSpecies((prev) => new Set([...prev, pet.species]));

      const catalog = SPECIES_CATALOG[pet.species];
      if (catalog) {
        setUnlockedCostumes((prev) => new Set([...prev, catalog.unlockedCostume]));
      }

      // Progress adoption quest
      setQuests((prev) =>
        prev.map((q) => (q.id === 'adopt_first' ? { ...q, currentCount: 1, isCompleted: true } : q))
      );
    };

    engine.onWeatherChange = (weather) => {
      setCurrentWeather(weather);
    };

    engine.onFetchSuccess = () => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === 'fetch_ball' ? { ...q, currentCount: q.currentCount + 1, isCompleted: true } : q
        )
      );
    };

    engine.onEditSignpost = (sign) => {
      setEditingSignpost(sign);
    };

    // Timer to update timeOfDay, weather, signpost and building status in React HUD
    const statusInterval = setInterval(() => {
      if (engineRef.current) {
        setTimeOfDay(Math.floor(engineRef.current.timeOfDay));
        setFenceCount(buildingSystem.fenceCount);
        setBuildTool(buildingSystem.buildTool);
        setCurrentWeather(engineRef.current.currentWeather);

        // Check if player is standing near a signpost
        const sign = buildingSystem.getNearbySignpost(engineRef.current.playerPos, 2.8);
        if (sign && sign.signData) {
          setNearbySignpost({ id: sign.id, title: sign.signData.title, icon: sign.signData.icon });
        } else {
          setNearbySignpost(null);
        }

        // Auto-check build_pen quest
        const placedFences = buildingSystem.placedStructures.filter((s) => s.type === 'fence').length;
        setQuests((prev) =>
          prev.map((q) => {
            if (q.id === 'build_pen') {
              return {
                ...q,
                currentCount: placedFences,
                isCompleted: placedFences >= q.targetCount,
              };
            }
            return q;
          })
        );
      }
    }, 400);

    return () => {
      clearInterval(statusInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync customization when player updates it
  const handleSaveCustomization = (newCustomization: PlayerCustomization) => {
    setPlayerCustomization(newCustomization);
    if (engineRef.current) {
      engineRef.current.updateCustomization(newCustomization);
    }
  };

  const handleStartGame = () => {
    setGameState('PLAYING');
    soundManager.startBackgroundMusic();
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const incrementQuestProgress = (questId: string, amount = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const newCount = q.currentCount + amount;
          return {
            ...q,
            currentCount: newCount,
            isCompleted: newCount >= q.targetCount,
          };
        }
        return q;
      })
    );
  };

  // Pet Taming Handlers
  const handleCallPet = () => {
    if (engineRef.current) {
      engineRef.current.callPet();
    }
  };

  const handleFeedPet = (petId: string) => {
    if (engineRef.current) {
      engineRef.current.feedPet(petId);
      incrementQuestProgress('care_station');
    }
  };

  const handleStrokePet = (petId: string) => {
    if (engineRef.current) {
      engineRef.current.strokePet(petId);
      incrementQuestProgress('care_station');
    }
  };

  const handleHugAdoptPet = (petId: string) => {
    if (engineRef.current) {
      engineRef.current.hugAdoptPet(petId);
    }
  };

  // Magic Wand
  const handleCastWand = () => {
    if (!isWandAvailable) return;
    if (engineRef.current) {
      const success = engineRef.current.castMagicWand();
      if (success) {
        setIsWandAvailable(false);
        incrementQuestProgress('magic_wand');
        setTimeout(() => setIsWandAvailable(true), 60000);
      }
    }
  };

  // Fetch Ball
  const handleThrowFetchBall = () => {
    if (engineRef.current) {
      const success = engineRef.current.throwFetchBall();
      if (success) {
        incrementQuestProgress('fetch_ball');
      }
    }
  };

  // Photo Mode handlers
  const handleCapturePhoto = (filter: string, caption: string, stickers: string[]) => {
    if (engineRef.current) {
      return engineRef.current.capturePhotoScreenshot();
    }
    return { dataUrl: '', petsInView: [] };
  };

  const handleSavePhoto = (newPhoto: PhotoMemory) => {
    setSavedPhotos((prev) => [newPhoto, ...prev]);
    setLoveCount((prev) => prev + 25);
    incrementQuestProgress('photo_shoot');
  };

  const handleDeletePhoto = (id: string) => {
    setSavedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Signpost saving
  const handleSaveSignpost = (id: string, newTitle: string, newIcon: string) => {
    buildingSystem.updateSignpost(id, newTitle, newIcon);
    incrementQuestProgress('name_sign');
    setEditingSignpost(null);
  };

  // Sanctuary Stars & Quests Claim
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((quest) => quest.id === questId);
    if (!q || q.isClaimed || !q.isCompleted) return;

    soundManager.playQuestComplete();
    setLoveCount((prev) => prev + q.rewardLove);

    setQuests((prev) =>
      prev.map((quest) => (quest.id === questId ? { ...quest, isClaimed: true } : quest))
    );

    const newPoints = starPoints + q.starContribution;
    setStarPoints(newPoints);

    // Star Level Thresholds: 1: 0, 2: 100, 3: 250, 4: 450, 5: 700
    const THRESHOLDS = [0, 100, 250, 450, 700];
    let newLevel = starLevel;
    for (let l = 1; l <= 5; l++) {
      if (newPoints >= THRESHOLDS[l - 1]) {
        newLevel = l;
      }
    }

    if (newLevel > starLevel) {
      setStarLevel(newLevel);
      soundManager.playStarUp();

      // Star unlock rewards
      if (newLevel >= 2) {
        setUnlockedCostumes((prev) => new Set([...prev, 'golden_adventurer']));
        buildingSystem.fenceCount += 30;
        setFenceCount(buildingSystem.fenceCount);
      }
      if (newLevel >= 5) {
        setUnlockedCostumes((prev) => new Set([...prev, 'nature_crown']));
      }
    }
  };

  // Building System Handlers
  const handleToggleBuildMode = () => {
    const nextState = !isBuildMode;
    setIsBuildMode(nextState);
    buildingSystem.setBuildMode(nextState, selectedBuildItem, buildTool);
  };

  const handleChangeBuildTool = (tool: 'place' | 'demolish') => {
    setBuildTool(tool);
    buildingSystem.setTool(tool);
  };

  const handleAdvanceTimeOfDay = () => {
    if (engineRef.current) {
      engineRef.current.timeOfDay = (engineRef.current.timeOfDay + 5) % 24;
      setTimeOfDay(Math.floor(engineRef.current.timeOfDay));
      soundManager.playClick();
    }
  };

  const handleSelectBuildItem = (type: string) => {
    setSelectedBuildItem(type);
    setIsBuildMode(true);
    buildingSystem.setBuildMode(true, type, buildTool);
  };

  const handleRotateBuildItem = () => {
    buildingSystem.rotatePreview();
  };

  const handlePlaceBuildItem = () => {
    const placed = buildingSystem.placeItem();
    if (placed) {
      setFenceCount(buildingSystem.fenceCount);
    }
  };

  const handleRemoveNearestBuildItem = () => {
    if (engineRef.current) {
      const removed = buildingSystem.removeNearest(engineRef.current.playerPos);
      if (removed) {
        setFenceCount(buildingSystem.fenceCount);
      }
    }
  };

  const handleAddFences = (amount: number) => {
    buildingSystem.fenceCount += amount;
    setFenceCount(buildingSystem.fenceCount);
  };

  // Camera Orbit & Zoom from buttons
  const handleRotateCamera = (delta: number) => {
    if (engineRef.current) {
      engineRef.current.rotateCameraBy(delta);
    }
  };

  const handleZoomCamera = (delta: number) => {
    if (engineRef.current) {
      engineRef.current.zoomCameraBy(delta);
    }
  };

  // Virtual Joystick
  const handleJoystickMove = (vec: { x: number; y: number }) => {
    if (engineRef.current) {
      engineRef.current.joystickVec = vec;
    }
  };

  // Pet Care Update
  const handleUpdatePetCare = (petId: string, careUpdate: Partial<PetData['care']>) => {
    const pet = petManager.pets.find((p) => p.data.id === petId);
    if (pet) {
      pet.data.care = { ...pet.data.care, ...careUpdate };
      setLoveCount((prev) => prev + 10);
    }
  };

  // Adoption modal close & rename
  const handleCloseAdoption = (newName?: string) => {
    if (newlyAdoptedPet && newName) {
      const p = petManager.pets.find((inst) => inst.data.id === newlyAdoptedPet.id);
      if (p) {
        p.data.name = newName;
      }
    }
    setNewlyAdoptedPet(null);
  };

  const handleCycleWeather = () => {
    if (engineRef.current) {
      engineRef.current.cycleWeather();
      setCurrentWeather(engineRef.current.currentWeather);
      soundManager.playClick();
    }
  };

  const allPetsData = petManager.pets.map((p) => p.data);
  const adoptedPetsCount = allPetsData.filter((p) => p.isAdopted).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Game State 1: Title Screen */}
      {gameState === 'TITLE_SCREEN' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenCustomizer={() => setShowCustomizer(true)}
          playerCustomization={playerCustomization}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game State 2: Main Playing HUD */}
      {gameState === 'PLAYING' && (
        <GameHUD
          loveCount={loveCount}
          adoptedCount={adoptedPetsCount}
          totalPets={allPetsData.length}
          timeOfDay={timeOfDay}
          onAdvanceTimeOfDay={handleAdvanceTimeOfDay}
          currentWeather={currentWeather}
          onCycleWeather={handleCycleWeather}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenBook={() => setShowPetBook(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenCustomizer={() => setShowCustomizer(true)}
          onOpenPetCare={(pet) => setPetInCareStation(pet)}
          targetedPet={targetedPet}
          onCallPet={handleCallPet}
          onFeedPet={handleFeedPet}
          onStrokePet={handleStrokePet}
          onHugAdoptPet={handleHugAdoptPet}
          isWandAvailable={isWandAvailable}
          onCastWand={handleCastWand}
          isBuildMode={isBuildMode}
          onToggleBuildMode={handleToggleBuildMode}
          buildTool={buildTool}
          onChangeBuildTool={handleChangeBuildTool}
          selectedBuildItem={selectedBuildItem}
          onRotateBuildItem={handleRotateBuildItem}
          onPlaceBuildItem={handlePlaceBuildItem}
          onRemoveNearestBuildItem={handleRemoveNearestBuildItem}
          fenceCount={fenceCount}
          onRotateCamera={handleRotateCamera}
          onZoomCamera={handleZoomCamera}
          onJoystickMove={handleJoystickMove}
        />
      )}

      {/* Modals & Dialogs */}
      {showCustomizer && (
        <CharacterCustomizer
          customization={playerCustomization}
          unlockedCostumes={unlockedCostumes}
          onSave={handleSaveCustomization}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {showPetBook && (
        <PetBookModal
          pets={allPetsData}
          onClose={() => setShowPetBook(false)}
          onSelectPetForCare={(pet) => {
            setShowPetBook(false);
            setPetInCareStation(pet);
          }}
        />
      )}

      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onSelectBuildItem={handleSelectBuildItem}
          adoptedSpecies={adoptedSpecies}
          onAddFences={handleAddFences}
        />
      )}

      {petInCareStation && (
        <PetCareModal
          pet={petInCareStation}
          onClose={() => setPetInCareStation(null)}
          onUpdatePetCare={handleUpdatePetCare}
        />
      )}

      {newlyAdoptedPet && (
        <AdoptionModal
          pet={newlyAdoptedPet}
          onClose={handleCloseAdoption}
        />
      )}
    </div>
  );
}
