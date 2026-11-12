/**
 * Game Types & Constants for Luisa's Magical Pet Sanctuary
 */

export type Gender = 'girl' | 'boy';

export type WeatherType = 'sunny' | 'rainy' | 'snowy';

export type HairColor = 'black' | 'red' | 'blonde' | 'light_brown' | 'dark_brown';

export type HairStyle = 'ponytail' | 'bob' | 'spiky' | 'pigtails' | 'wavy' | 'curly';

export type CostumeId =
  | 'default_adventurer'
  | 'unicorn_hoodie'
  | 'puppy_shirt'
  | 'kitten_overalls'
  | 'bunny_romper'
  | 'fox_cloak'
  | 'bear_pajamas'
  | 'celestial_robe'
  | 'golden_adventurer'
  | 'nature_crown';

export interface PlayerCustomization {
  name: string;
  gender: Gender;
  hairColor: HairColor;
  hairStyle: HairStyle;
  costume: CostumeId;
}

export type SpeciesId =
  | 'cat'
  | 'dog'
  | 'puppy'
  | 'kitten'
  | 'unicorn'
  | 'bunny'
  | 'fox'
  | 'bear';

export type PetRarity =
  | 'normal'
  | 'albino'
  | 'melanistic'
  | 'rainbow'
  | 'winged'
  | 'celestial';

export type PetAIState =
  | 'WILD_ROAM'
  | 'SKITTISH_FLEE'
  | 'CURIOUS_CALLED'
  | 'APPROACHING_FOOD'
  | 'BEING_PET'
  | 'TAMED_DOMESTIC'
  | 'FOLLOWING'
  | 'SLEEPING'
  | 'PLAYING'
  | 'CHASING_BALL'
  | 'RETURNING_BALL';

export interface PhotoMemory {
  id: string;
  dataUrl: string;
  timestamp: number;
  caption: string;
  filter: string;
  stickers: string[];
  petsCaptured: string[];
}

export interface SanctuaryQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardLove: number;
  starContribution: number;
}

export interface SignpostData {
  id: string;
  title: string;
  icon: string;
  position: { x: number; y: number; z: number };
  rotation: number;
}

export interface PetCareStatus {
  hunger: number; // 0 - 100
  cleanliness: number; // 0 - 100
  happiness: number; // 0 - 100
  groomed: boolean;
  lastCareTime: number;
}

export interface PetData {
  id: string;
  name: string;
  species: SpeciesId;
  variant: PetRarity;
  isAdopted: boolean;
  state: PetAIState;
  tameStage: number; // 0: Wild, 1: Called, 2: Fed, 3: Pet, 4: Adopted
  position: { x: number; y: number; z: number };
  rotation: number;
  care: PetCareStatus;
  favoriteFood: string;
  personality: string;
  insidePenId?: string | null;
  meshRef?: any;
}

export type TreatType =
  | 'strawberry'
  | 'golden_bone'
  | 'rainbow_berry'
  | 'crunchy_carrot'
  | 'sweet_berry'
  | 'honey_comb'
  | 'magic_cookie';

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'fence' | 'bed' | 'toy' | 'feeding' | 'decor';
  unlockedBySpecies?: SpeciesId;
  unlockedByRarity?: PetRarity;
  isUnlocked: boolean;
  icon: string;
  description: string;
  modelType: string;
}

export interface PlacedStructure {
  id: string;
  type: string;
  category: 'fence' | 'gate' | 'furniture';
  position: { x: number; y: number; z: number };
  rotation: number;
  mesh?: any;
  signData?: { title: string; icon: string };
}

export interface SpeciesInfo {
  id: SpeciesId;
  name: string;
  sound: string;
  favoriteTreat: TreatType;
  treatName: string;
  unlockedCostume: CostumeId;
  costumeName: string;
  unlockedFurniture: string;
  description: string;
}

export const SPECIES_CATALOG: Record<SpeciesId, SpeciesInfo> = {
  kitten: {
    id: 'kitten',
    name: 'Kitten',
    sound: 'Mew!',
    favoriteTreat: 'strawberry',
    treatName: 'Sweet Strawberry',
    unlockedCostume: 'kitten_overalls',
    costumeName: 'Kitten Overalls',
    unlockedFurniture: 'Kitten Scratch Tower',
    description: 'Playful tiny furball that loves to chase butterflies.',
  },
  cat: {
    id: 'cat',
    name: 'Cat',
    sound: 'Meow~',
    favoriteTreat: 'strawberry',
    treatName: 'Sweet Strawberry',
    unlockedCostume: 'kitten_overalls',
    costumeName: 'Cozy Cat Hoodie',
    unlockedFurniture: 'Velvet Cat Tree',
    description: 'Gentle and purrs softly when brushed.',
  },
  puppy: {
    id: 'puppy',
    name: 'Puppy',
    sound: 'Yip yip!',
    favoriteTreat: 'golden_bone',
    treatName: 'Golden Pup Biscuit',
    unlockedCostume: 'puppy_shirt',
    costumeName: 'Puppy T-Shirt',
    unlockedFurniture: 'Puppy Play Ball',
    description: 'Bouncy, loyal, and wags its tail with pure delight.',
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    sound: 'Woof woof!',
    favoriteTreat: 'golden_bone',
    treatName: 'Crisp Golden Bone',
    unlockedCostume: 'puppy_shirt',
    costumeName: 'Puppy Patrol Cape',
    unlockedFurniture: 'Cozy Doghouse',
    description: 'Devoted friend that loves playing fetch around the pens.',
  },
  unicorn: {
    id: 'unicorn',
    name: 'Unicorn',
    sound: 'Neiigh! ✨',
    favoriteTreat: 'rainbow_berry',
    treatName: 'Shimmering Rainbow Berry',
    unlockedCostume: 'unicorn_hoodie',
    costumeName: 'Magical Unicorn Hoodie',
    unlockedFurniture: 'Albino Crystal Bed',
    description: 'Legendary peaceful guardian with a glowing spiral horn.',
  },
  bunny: {
    id: 'bunny',
    name: 'Bunny',
    sound: 'Squeak!',
    favoriteTreat: 'crunchy_carrot',
    treatName: 'Crunchy Gold Carrot',
    unlockedCostume: 'bunny_romper',
    costumeName: 'Fluffy Bunny Romper',
    unlockedFurniture: 'Giant Carrot Cushion',
    description: 'Hops merrily through clover patches with twitchy ears.',
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    sound: 'Yip!',
    favoriteTreat: 'sweet_berry',
    treatName: 'Woodland Sweet Berry',
    unlockedCostume: 'fox_cloak',
    costumeName: 'Forest Fox Cloak',
    unlockedFurniture: 'Fox Leaf Hammock',
    description: 'Curious critter with a bushy tail and amber eyes.',
  },
  bear: {
    id: 'bear',
    name: 'Bear',
    sound: 'Grumble-hug!',
    favoriteTreat: 'honey_comb',
    treatName: 'Sweet Honey Comb',
    unlockedCostume: 'bear_pajamas',
    costumeName: 'Cozy Bear Pajamas',
    unlockedFurniture: 'Warm Cave Bed',
    description: 'Gentle giant who gives the warmest, coziest cuddles.',
  },
};

export const HAIR_COLORS: Record<HairColor, { name: string; hex: string }> = {
  black: { name: 'Midnight Black', hex: '#222225' },
  red: { name: 'Autumn Red', hex: '#b74128' },
  blonde: { name: 'Sunny Blonde', hex: '#f7d358' },
  light_brown: { name: 'Chestnut Brown', hex: '#8c593e' },
  dark_brown: { name: 'Chocolate Brown', hex: '#442618' },
};

export const HAIR_STYLES: { id: HairStyle; name: string }[] = [
  { id: 'ponytail', name: 'High Ponytail' },
  { id: 'bob', name: 'Cute Bob Cut' },
  { id: 'pigtails', name: 'Bouncy Pigtails' },
  { id: 'spiky', name: 'Messy Spiky' },
  { id: 'wavy', name: 'Gentle Waves' },
  { id: 'curly', name: 'Fluffy Curls' },
];

export const COSTUMES: Record<CostumeId, { name: string; description: string; color: string }> = {
  default_adventurer: {
    name: 'Forest Adventurer',
    description: 'Comfortable explorer tunic with lovely leather pouch.',
    color: '#6aa84f',
  },
  unicorn_hoodie: {
    name: 'Unicorn Hoodie',
    description: 'Pastel rainbow hoodie with a cute soft horn!',
    color: '#d0a9f5',
  },
  puppy_shirt: {
    name: 'Puppy T-Shirt',
    description: 'Sunny yellow tee with floppy dog ears badge.',
    color: '#ffd966',
  },
  kitten_overalls: {
    name: 'Kitten Overalls',
    description: 'Pink denim overalls with whiskered cat pocket.',
    color: '#f48fb1',
  },
  bunny_romper: {
    name: 'Bunny Romper',
    description: 'Fluffy white romper with a cute pom-pom tail.',
    color: '#e1bee7',
  },
  fox_cloak: {
    name: 'Forest Fox Cloak',
    description: 'Cozy orange cape with white fur trim.',
    color: '#e67e22',
  },
  bear_pajamas: {
    name: 'Bear Onesie',
    description: 'Warmest fuzzy fleece onesie with round bear ears.',
    color: '#a1887f',
  },
  celestial_robe: {
    name: 'Celestial Starlight Robe',
    description: 'Sparkling twilight robe gifted to master pet protectors.',
    color: '#5c6bc0',
  },
};
