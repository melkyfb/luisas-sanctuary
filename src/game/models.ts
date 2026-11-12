/**
 * Beautiful Stylized Low-Poly 3D Models for Luisa's Magical Pet Sanctuary
 * Designed with kawaii aesthetics (chibi proportions, faceted organic geometries,
 * specular catchlight eyes, chubby cheeks, sculpted ears and layered accessories).
 */

import * as THREE from 'three';
import {
  CostumeId,
  Gender,
  HairColor,
  HAIR_COLORS,
  HairStyle,
  PetRarity,
  SpeciesId,
} from './types';

// Shared material cache
const matCache = new Map<string, THREE.MeshStandardMaterial>();

function getMat(
  color: string | number,
  roughness = 0.55,
  metalness = 0.05,
  extra?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}_${JSON.stringify(extra || {})}`;
  if (!matCache.has(key)) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true, // Iconic crisp low-poly aesthetic!
      ...extra,
    });
    matCache.set(key, mat);
  }
  return matCache.get(key)!;
}

// Low-poly faceted base geometries (Flat-shaded faceted shapes)
const geoBox = new THREE.BoxGeometry(1, 1, 1);
const geoDodeca = new THREE.DodecahedronGeometry(1, 0); // Lovely 12-faced faceted round shape!
const geoIcosa = new THREE.IcosahedronGeometry(1, 0);   // 20-faced crisp low-poly jewel shape
const geoSphere = new THREE.SphereGeometry(1, 8, 6);   // Low-poly faceted sphere
const geoCylinder = new THREE.CylinderGeometry(1, 1, 1, 8);
const geoCone = new THREE.ConeGeometry(1, 1, 7);

// Reusable eye sparkle material
const eyeMatDark = getMat('#1a162b', 0.2, 0.1);
const eyeCatchlightMat = getMat('#ffffff', 0.1, 0.0, { emissive: '#ffffff', emissiveIntensity: 0.2 });

/**
 * Creates a pair of expressive anime/kawaii low-poly eyes with white catchlight shines
 */
function createKawaiiEyes(scale = 0.14, eyeColor?: string): THREE.Group {
  const eyePair = new THREE.Group();
  const mat = eyeColor ? getMat(eyeColor, 0.2, 0.2) : eyeMatDark;

  // Left Eye
  const leftEye = new THREE.Mesh(geoDodeca, mat);
  leftEye.scale.set(scale, scale * 1.25, scale * 0.7);
  leftEye.position.set(-scale * 2.2, 0, 0);
  eyePair.add(leftEye);

  // Left Catchlight Sparkle (cute white dot)
  const leftSparkle = new THREE.Mesh(geoSphere, eyeCatchlightMat);
  leftSparkle.scale.set(scale * 0.35, scale * 0.35, scale * 0.35);
  leftSparkle.position.set(-scale * 2.0, scale * 0.3, scale * 0.55);
  eyePair.add(leftSparkle);

  // Right Eye
  const rightEye = leftEye.clone();
  rightEye.position.set(scale * 2.2, 0, 0);
  eyePair.add(rightEye);

  // Right Catchlight Sparkle
  const rightSparkle = leftSparkle.clone();
  rightSparkle.position.set(scale * 2.4, scale * 0.3, scale * 0.55);
  eyePair.add(rightSparkle);

  return eyePair;
}

/**
 * Creates a Beautiful Chibi Player Avatar (Boy/Girl with stylized hair & outfits)
 */
export function createPlayerModel(
  gender: Gender,
  hairColor: HairColor,
  hairStyle: HairStyle,
  costume: CostumeId
): {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  headGroup: THREE.Group;
  wandProp: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = 'player_root';

  const skinMat = getMat('#ffdfba', 0.8, 0.0);
  const hairHex = HAIR_COLORS[hairColor]?.hex || '#442618';
  const hairMat = getMat(hairHex, 0.85, 0.05);
  const cheekMat = getMat('#ff80ab', 0.9, 0.0);

  // Outfit colors based on unlocked theme
  let tunicColor = '#558b2f'; // Explorer
  let pantsColor = '#37474f';
  let bootsColor = '#4e342e';
  let trimColor = '#ffd54f';

  if (costume === 'unicorn_hoodie') {
    tunicColor = '#ce93d8';
    pantsColor = '#f3e5f5';
    trimColor = '#f48fb1';
  } else if (costume === 'puppy_shirt') {
    tunicColor = '#ffca28';
    pantsColor = '#1976d2';
    trimColor = '#00e676';
  } else if (costume === 'kitten_overalls') {
    tunicColor = '#f48fb1';
    pantsColor = '#fce4ec';
    trimColor = '#ffffff';
  } else if (costume === 'bunny_romper') {
    tunicColor = '#f8bbd0';
    pantsColor = '#ffffff';
    trimColor = '#ba68c8';
  } else if (costume === 'fox_cloak') {
    tunicColor = '#ef6c00';
    pantsColor = '#5d4037';
    trimColor = '#ffffff';
  } else if (costume === 'bear_pajamas') {
    tunicColor = '#8d6e63';
    pantsColor = '#5d4037';
    trimColor = '#d7ccc8';
  } else if (costume === 'celestial_robe') {
    tunicColor = '#3f51b5';
    pantsColor = '#1a237e';
    trimColor = '#ffd54f';
  } else if (costume === 'golden_adventurer') {
    tunicColor = '#ffd54f';
    pantsColor = '#fff9c4';
    trimColor = '#ffb300';
  } else if (costume === 'nature_crown') {
    tunicColor = '#81c784';
    pantsColor = '#e8f5e9';
    trimColor = '#ffd54f';
  }

  const tunicMat = getMat(tunicColor, 0.65, 0.05);
  const pantsMat = getMat(pantsColor, 0.7, 0.05);
  const bootsMat = getMat(bootsColor, 0.8, 0.05);
  const trimMat = getMat(trimColor, 0.4, 0.2);

  // 1. Torso (Faceted cute vest)
  const torso = new THREE.Mesh(geoCylinder, tunicMat);
  torso.scale.set(0.42, 0.65, 0.35);
  torso.position.set(0, 0.95, 0);
  torso.castShadow = true;
  root.add(torso);

  // Belt & Satchel pouch
  const belt = new THREE.Mesh(geoCylinder, getMat('#4e342e', 0.8, 0.1));
  belt.scale.set(0.44, 0.1, 0.37);
  belt.position.set(0, 0.75, 0);
  root.add(belt);

  const pouch = new THREE.Mesh(geoDodeca, getMat('#8d6e63', 0.8, 0.1));
  pouch.scale.set(0.12, 0.14, 0.1);
  pouch.position.set(0.4, 0.75, 0.1);
  root.add(pouch);

  // Collar
  const collar = new THREE.Mesh(geoCylinder, trimMat);
  collar.scale.set(0.32, 0.12, 0.28);
  collar.position.set(0, 1.3, 0);
  root.add(collar);

  // 2. Chibi Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.62, 0);
  root.add(headGroup);

  // Faceted chubby chibi head
  const headMesh = new THREE.Mesh(geoDodeca, skinMat);
  headMesh.scale.set(0.55, 0.52, 0.52);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Eyes with catchlights
  const eyes = createKawaiiEyes(0.09);
  eyes.position.set(0, 0.04, 0.46);
  headGroup.add(eyes);

  // Blush cheeks
  const cheekL = new THREE.Mesh(geoDodeca, cheekMat);
  cheekL.scale.set(0.12, 0.06, 0.04);
  cheekL.position.set(-0.28, -0.1, 0.44);
  headGroup.add(cheekL);

  const cheekR = cheekL.clone();
  cheekR.position.set(0.28, -0.1, 0.44);
  headGroup.add(cheekR);

  // Cute tiny button nose
  const nose = new THREE.Mesh(geoSphere, getMat('#ffccbc', 0.8, 0));
  nose.scale.set(0.05, 0.04, 0.05);
  nose.position.set(0, -0.04, 0.52);
  headGroup.add(nose);

  // Hair Base (Sculpted low-poly hair helmet)
  const hairCrown = new THREE.Mesh(geoDodeca, hairMat);
  hairCrown.scale.set(0.58, 0.45, 0.56);
  hairCrown.position.set(0, 0.22, -0.05);
  headGroup.add(hairCrown);

  // Front bangs
  for (let b = -2; b <= 2; b++) {
    const bang = new THREE.Mesh(geoCone, hairMat);
    bang.scale.set(0.12, 0.28, 0.1);
    bang.position.set(b * 0.14, 0.22, 0.42);
    bang.rotation.x = Math.PI * 0.85;
    bang.rotation.z = -b * 0.15;
    headGroup.add(bang);
  }

  // Hair style specific details
  if (hairStyle === 'ponytail') {
    const ponytail = new THREE.Mesh(geoCone, hairMat);
    ponytail.scale.set(0.22, 0.65, 0.22);
    ponytail.position.set(0, 0.25, -0.55);
    ponytail.rotation.x = Math.PI * 0.72;
    headGroup.add(ponytail);

    const ribbon = new THREE.Mesh(geoDodeca, trimMat);
    ribbon.scale.set(0.12, 0.12, 0.12);
    ribbon.position.set(0, 0.35, -0.42);
    headGroup.add(ribbon);
  } else if (hairStyle === 'pigtails') {
    [-0.45, 0.45].forEach((sideX) => {
      const pig = new THREE.Mesh(geoCone, hairMat);
      pig.scale.set(0.16, 0.52, 0.16);
      pig.position.set(sideX, 0.15, -0.2);
      pig.rotation.z = sideX > 0 ? 0.45 : -0.45;
      pig.rotation.x = 0.2;
      headGroup.add(pig);
    });
  } else if (hairStyle === 'bob') {
    [-0.48, 0.48].forEach((sideX) => {
      const bobLock = new THREE.Mesh(geoDodeca, hairMat);
      bobLock.scale.set(0.16, 0.38, 0.45);
      bobLock.position.set(sideX, -0.08, 0.05);
      headGroup.add(bobLock);
    });
  } else if (hairStyle === 'spiky') {
    for (let s = -2; s <= 2; s++) {
      const spike = new THREE.Mesh(geoCone, hairMat);
      spike.scale.set(0.12, 0.32, 0.12);
      spike.position.set(s * 0.15, 0.48, s === 0 ? 0 : -0.1);
      spike.rotation.z = -s * 0.25;
      headGroup.add(spike);
    }
  }

  // Costume head attachments
  if (costume === 'unicorn_hoodie') {
    const horn = new THREE.Mesh(geoCone, getMat('#ffd700', 0.2, 0.9, { emissive: '#ffd700', emissiveIntensity: 0.5 }));
    horn.scale.set(0.08, 0.45, 0.08);
    horn.position.set(0, 0.62, 0.2);
    horn.rotation.x = -0.25;
    headGroup.add(horn);
  }

  // 3. Legs (chibi tapered)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.18, 0.6, 0);
  const leftLegMesh = new THREE.Mesh(geoCylinder, pantsMat);
  leftLegMesh.scale.set(0.14, 0.45, 0.14);
  leftLegMesh.position.set(0, -0.2, 0);
  leftLeg.add(leftLegMesh);

  const leftBoot = new THREE.Mesh(geoDodeca, bootsMat);
  leftBoot.scale.set(0.16, 0.14, 0.24);
  leftBoot.position.set(0, -0.45, 0.05);
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.18, 0.6, 0);
  const rightLegMesh = leftLegMesh.clone();
  rightLeg.add(rightLegMesh);
  const rightBoot = leftBoot.clone();
  rightLeg.add(rightBoot);
  root.add(rightLeg);

  // 4. Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.45, 1.25, 0);
  const leftSleeve = new THREE.Mesh(geoCylinder, tunicMat);
  leftSleeve.scale.set(0.12, 0.35, 0.12);
  leftSleeve.position.set(0, -0.15, 0);
  leftArm.add(leftSleeve);

  const leftHand = new THREE.Mesh(geoSphere, skinMat);
  leftHand.scale.set(0.1, 0.1, 0.1);
  leftHand.position.set(0, -0.38, 0);
  leftArm.add(leftHand);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.45, 1.25, 0);
  const rightSleeve = leftSleeve.clone();
  rightArm.add(rightSleeve);
  const rightHand = leftHand.clone();
  rightArm.add(rightHand);
  root.add(rightArm);

  // 5. Stylized Golden Star Wand Prop
  const wandProp = new THREE.Group();
  wandProp.position.set(0, -0.35, 0.18);
  wandProp.rotation.x = Math.PI * 0.42;

  const wandShaft = new THREE.Mesh(geoCylinder, getMat('#d4af37', 0.25, 0.8));
  wandShaft.scale.set(0.025, 0.55, 0.025);
  wandShaft.position.set(0, 0.25, 0);
  wandProp.add(wandShaft);

  // Luminescent Faceted Crystal Star Tip
  const crystalTip = new THREE.Mesh(geoIcosa, getMat('#fff59d', 0.1, 0.9, { emissive: '#ffd700', emissiveIntensity: 0.85 }));
  crystalTip.scale.set(0.12, 0.12, 0.12);
  crystalTip.position.set(0, 0.54, 0);
  wandProp.add(crystalTip);

  rightArm.add(wandProp);

  return { group: root, leftLeg, rightLeg, leftArm, rightArm, headGroup, wandProp };
}

/**
 * Creates a Beautiful, Kawaii Stylized Low-Poly Animal Model
 */
export function createAnimalModel(species: SpeciesId, variant: PetRarity): {
  group: THREE.Group;
  tailGroup?: THREE.Group;
  headGroup?: THREE.Group;
  earsGroup?: THREE.Group;
  wingsGroup?: THREE.Group;
  legs: THREE.Group[];
  starsParticleGroup?: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = `animal_${species}_${variant}`;

  // Species Base Colors
  let coatColor = '#f5b041';
  let bellyColor = '#fffde7';
  let accentColor = '#e65100';
  let innerEarColor = '#f8bbd0';
  let eyeColor: string | undefined = undefined;

  const isAlbino = variant === 'albino';
  const isMelanistic = variant === 'melanistic';
  const isRainbow = variant === 'rainbow';
  const isCelestial = variant === 'celestial';
  const isWinged = variant === 'winged';

  switch (species) {
    case 'kitten':
      coatColor = '#ffb74d';
      bellyColor = '#ffffff';
      accentColor = '#f57c00';
      break;
    case 'cat':
      coatColor = '#f39c12';
      bellyColor = '#fff3e0';
      accentColor = '#d35400';
      break;
    case 'puppy':
      coatColor = '#d7ccc8';
      bellyColor = '#ffffff';
      accentColor = '#8d6e63';
      break;
    case 'dog':
      coatColor = '#8d6e63';
      bellyColor = '#efebe9';
      accentColor = '#4e342e';
      break;
    case 'unicorn':
      coatColor = '#fce4ec';
      bellyColor = '#ffffff';
      accentColor = '#ba68c8';
      break;
    case 'bunny':
      coatColor = '#f5f5f5';
      bellyColor = '#ffffff';
      accentColor = '#f48fb1';
      break;
    case 'fox':
      coatColor = '#e65100';
      bellyColor = '#ffffff';
      accentColor = '#212121';
      break;
    case 'bear':
      coatColor = '#6d4c41';
      bellyColor = '#a1887f';
      accentColor = '#3e2723';
      break;
  }

  // Rarity coat overrides
  if (isAlbino) {
    coatColor = '#ffffff';
    bellyColor = '#ffffff';
    accentColor = '#f8bbd0';
    eyeColor = '#e91e63'; // Ruby pink eyes
  } else if (isMelanistic) {
    coatColor = '#1e1b29';
    bellyColor = '#121019';
    accentColor = '#6a1b9a';
    eyeColor = '#00e5ff'; // Cyan starry glow
  } else if (isRainbow) {
    coatColor = '#ce93d8';
    bellyColor = '#80deea';
    accentColor = '#ffe082';
  } else if (isCelestial) {
    coatColor = '#283593';
    bellyColor = '#3f51b5';
    accentColor = '#ffd54f';
    eyeColor = '#ffd54f';
  }

  const coatMat = getMat(coatColor, 0.55, 0.05);
  const bellyMat = getMat(bellyColor, 0.65, 0.0);
  const accentMat = getMat(accentColor, 0.5, 0.1);
  const innerEarMat = getMat(innerEarColor, 0.7, 0.0);
  const noseMat = getMat(accentColor, 0.3, 0.1);

  // Proportions
  const isBaby = species === 'kitten' || species === 'puppy';
  const sizeMult = isBaby ? 0.68 : species === 'bear' ? 1.35 : species === 'unicorn' ? 1.25 : 1.0;

  // 1. Chubby Low-Poly Faceted Torso
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  root.add(bodyGroup);

  const bodyMesh = new THREE.Mesh(geoDodeca, coatMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;

  if (species === 'bunny') {
    bodyMesh.scale.set(0.48 * sizeMult, 0.44 * sizeMult, 0.58 * sizeMult);
    bodyMesh.position.set(0, 0.35 * sizeMult, 0);
  } else if (species === 'bear') {
    bodyMesh.scale.set(0.85 * sizeMult, 0.8 * sizeMult, 1.05 * sizeMult);
    bodyMesh.position.set(0, 0.6 * sizeMult, 0);
  } else {
    bodyMesh.scale.set(0.52 * sizeMult, 0.48 * sizeMult, 0.78 * sizeMult);
    bodyMesh.position.set(0, 0.45 * sizeMult, 0);
  }
  bodyGroup.add(bodyMesh);

  // Soft belly bib
  const bellyMesh = new THREE.Mesh(geoDodeca, bellyMat);
  bellyMesh.scale.set(bodyMesh.scale.x * 0.8, bodyMesh.scale.y * 0.75, bodyMesh.scale.z * 0.85);
  bellyMesh.position.set(0, bodyMesh.position.y - 0.04 * sizeMult, 0.02 * sizeMult);
  bodyGroup.add(bellyMesh);

  // 2. Head Group (Kawaii faceted round head with cheeks)
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  const headY = bodyMesh.position.y + bodyMesh.scale.y * 0.68;
  const headZ = bodyMesh.scale.z * 0.52;
  headGroup.position.set(0, headY, headZ);
  root.add(headGroup);

  const headMesh = new THREE.Mesh(geoDodeca, coatMat);
  headMesh.castShadow = true;
  const headW = (isBaby ? 0.62 : 0.5) * sizeMult;
  const headH = (isBaby ? 0.56 : 0.46) * sizeMult;
  const headD = (isBaby ? 0.55 : 0.48) * sizeMult;
  headMesh.scale.set(headW, headH, headD);
  headGroup.add(headMesh);

  // Kawaii Specular Catchlight Eyes
  const eyes = createKawaiiEyes(0.085 * sizeMult, eyeColor);
  eyes.position.set(0, 0.06 * sizeMult, headD * 0.75);
  headGroup.add(eyes);

  // Cute Snout / Muzzle
  const snoutMesh = new THREE.Mesh(geoDodeca, bellyMat);
  const snoutLen = (species === 'fox' || species === 'dog' ? 0.32 : 0.2) * sizeMult;
  snoutMesh.scale.set(headW * 0.55, headH * 0.38, snoutLen);
  snoutMesh.position.set(0, -headH * 0.16, headD * 0.7 + snoutLen * 0.4);
  headGroup.add(snoutMesh);

  // Button Nose
  const nose = new THREE.Mesh(geoSphere, noseMat);
  nose.scale.set(0.07 * sizeMult, 0.05 * sizeMult, 0.06 * sizeMult);
  nose.position.set(0, snoutMesh.position.y + 0.04 * sizeMult, snoutMesh.position.z + snoutLen * 0.48);
  headGroup.add(nose);

  // Blush Cheeks
  const cheekMat = getMat('#ff80ab', 0.8, 0.0);
  const cheekL = new THREE.Mesh(geoDodeca, cheekMat);
  cheekL.scale.set(0.12 * sizeMult, 0.06 * sizeMult, 0.05 * sizeMult);
  cheekL.position.set(-headW * 0.52, -headH * 0.1, headD * 0.65);
  headGroup.add(cheekL);

  const cheekR = cheekL.clone();
  cheekR.position.set(headW * 0.52, -headH * 0.1, headD * 0.65);
  headGroup.add(cheekR);

  // Ears
  const earsGroup = new THREE.Group();
  earsGroup.name = 'ears';
  headGroup.add(earsGroup);

  if (species === 'bunny') {
    // Tall faceted bunny ears
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(geoCone, coatMat);
      ear.scale.set(0.14 * sizeMult, 0.68 * sizeMult, 0.12 * sizeMult);
      ear.position.set(side * headW * 0.28, headH * 0.85, 0);
      ear.rotation.z = side * 0.12;
      earsGroup.add(ear);

      const innerEar = new THREE.Mesh(geoCone, innerEarMat);
      innerEar.scale.set(0.08 * sizeMult, 0.5 * sizeMult, 0.06 * sizeMult);
      innerEar.position.set(side * headW * 0.28, headH * 0.85, 0.04 * sizeMult);
      innerEar.rotation.z = side * 0.12;
      earsGroup.add(innerEar);
    });
  } else if (species === 'dog' || species === 'puppy') {
    // Floppy ears
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(geoDodeca, accentMat);
      ear.scale.set(0.16 * sizeMult, 0.38 * sizeMult, 0.18 * sizeMult);
      ear.position.set(side * headW * 0.65, headH * 0.18, 0);
      ear.rotation.z = side * 0.35;
      earsGroup.add(ear);
    });
  } else if (species === 'bear') {
    // Round bear ears
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(geoDodeca, coatMat);
      ear.scale.set(0.18 * sizeMult, 0.18 * sizeMult, 0.1 * sizeMult);
      ear.position.set(side * headW * 0.52, headH * 0.52, 0);
      earsGroup.add(ear);
    });
  } else {
    // Sharp faceted ears (Cat, Kitten, Fox, Unicorn)
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(geoCone, species === 'fox' ? accentMat : coatMat);
      ear.scale.set(0.16 * sizeMult, 0.35 * sizeMult, 0.14 * sizeMult);
      ear.position.set(side * headW * 0.38, headH * 0.65, 0);
      ear.rotation.z = side * 0.22;
      earsGroup.add(ear);
    });
  }

  // Unicorn Golden Spiral Horn & Flowing Mane
  if (species === 'unicorn') {
    const horn = new THREE.Mesh(geoCone, getMat('#ffd700', 0.2, 0.9, { emissive: '#ffd700', emissiveIntensity: 0.6 }));
    horn.scale.set(0.08 * sizeMult, 0.6 * sizeMult, 0.08 * sizeMult);
    horn.position.set(0, headH * 0.82, 0.16 * sizeMult);
    horn.rotation.x = -0.3;
    headGroup.add(horn);

    const maneMat = getMat('#e1bee7', 0.4, 0.1);
    for (let m = 0; m < 3; m++) {
      const lock = new THREE.Mesh(geoDodeca, maneMat);
      lock.scale.set(0.14 * sizeMult, 0.22 * sizeMult, 0.25 * sizeMult);
      lock.position.set(0, headH * 0.3 - m * 0.14 * sizeMult, -headD * 0.5);
      headGroup.add(lock);
    }
  }

  // 3. Legs (Cute chubby rounded paws)
  const legs: THREE.Group[] = [];
  const legPositions = [
    { x: -bodyMesh.scale.x * 0.45, z: bodyMesh.scale.z * 0.4 },
    { x: bodyMesh.scale.x * 0.45, z: bodyMesh.scale.z * 0.4 },
    { x: -bodyMesh.scale.x * 0.45, z: -bodyMesh.scale.z * 0.4 },
    { x: bodyMesh.scale.x * 0.45, z: -bodyMesh.scale.z * 0.4 },
  ];

  const legH = (species === 'unicorn' ? 0.48 : 0.28) * sizeMult;
  const legW = (species === 'bear' ? 0.22 : 0.15) * sizeMult;

  legPositions.forEach((pos, i) => {
    const legG = new THREE.Group();
    legG.name = `leg_${i}`;
    legG.position.set(pos.x, legH, pos.z);

    const legM = new THREE.Mesh(geoCylinder, species === 'fox' && i < 2 ? accentMat : coatMat);
    legM.scale.set(legW, legH, legW);
    legM.position.set(0, -legH * 0.5, 0);
    legM.castShadow = true;
    legG.add(legM);

    const paw = new THREE.Mesh(geoDodeca, bellyMat);
    paw.scale.set(legW * 1.2, legW * 0.8, legW * 1.3);
    paw.position.set(0, -legH, legW * 0.2);
    paw.castShadow = true;
    legG.add(paw);

    root.add(legG);
    legs.push(legG);
  });

  // 4. Tail
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  tailGroup.position.set(0, bodyMesh.position.y * 1.1, -bodyMesh.scale.z * 0.52);
  root.add(tailGroup);

  if (species === 'bunny') {
    const puff = new THREE.Mesh(geoDodeca, bellyMat);
    puff.scale.set(0.14 * sizeMult, 0.14 * sizeMult, 0.14 * sizeMult);
    tailGroup.add(puff);
  } else if (species === 'bear') {
    const stub = new THREE.Mesh(geoDodeca, coatMat);
    stub.scale.set(0.14 * sizeMult, 0.14 * sizeMult, 0.14 * sizeMult);
    tailGroup.add(stub);
  } else if (species === 'fox') {
    // Bushy fox tail with white tip
    const tailBase = new THREE.Mesh(geoDodeca, coatMat);
    tailBase.scale.set(0.25 * sizeMult, 0.25 * sizeMult, 0.55 * sizeMult);
    tailBase.position.set(0, 0.18 * sizeMult, -0.28 * sizeMult);
    tailBase.rotation.x = -0.55;
    tailGroup.add(tailBase);

    const tailTip = new THREE.Mesh(geoCone, bellyMat);
    tailTip.scale.set(0.16 * sizeMult, 0.32 * sizeMult, 0.16 * sizeMult);
    tailTip.position.set(0, 0.38 * sizeMult, -0.55 * sizeMult);
    tailTip.rotation.x = -0.55;
    tailGroup.add(tailTip);
  } else {
    // Curving tail
    const tailM = new THREE.Mesh(geoCylinder, coatMat);
    tailM.scale.set(0.06 * sizeMult, 0.5 * sizeMult, 0.06 * sizeMult);
    tailM.position.set(0, 0.22 * sizeMult, -0.16 * sizeMult);
    tailM.rotation.x = -0.7;
    tailGroup.add(tailM);
  }

  // 5. Feathered Low-Poly Wings
  let wingsGroup: THREE.Group | undefined;
  if (isWinged) {
    wingsGroup = new THREE.Group();
    wingsGroup.name = 'wings';
    wingsGroup.position.set(0, bodyMesh.position.y + bodyMesh.scale.y * 0.45, 0);

    const wingMat = getMat('#ffffff', 0.4, 0.1);
    [-1, 1].forEach((side) => {
      const wing = new THREE.Mesh(geoDodeca, wingMat);
      wing.scale.set(0.08 * sizeMult, 0.38 * sizeMult, 0.65 * sizeMult);
      wing.position.set(side * bodyMesh.scale.x * 0.6, 0.18 * sizeMult, 0);
      wing.rotation.z = side * 0.45;
      wingsGroup!.add(wing);
    });
    root.add(wingsGroup);
  }

  // 6. Celestial floating stars
  let starsParticleGroup: THREE.Group | undefined;
  if (isCelestial) {
    starsParticleGroup = new THREE.Group();
    starsParticleGroup.name = 'celestial_stars';
    const starMat = getMat('#ffeb3b', 0.1, 0.9, { emissive: '#ffd700', emissiveIntensity: 0.95 });
    for (let s = 0; s < 4; s++) {
      const star = new THREE.Mesh(geoIcosa, starMat);
      star.scale.set(0.08, 0.08, 0.08);
      star.position.set(
        Math.cos((s * Math.PI) / 2) * 0.7 * sizeMult,
        0.5 * sizeMult + s * 0.18,
        Math.sin((s * Math.PI) / 2) * 0.7 * sizeMult
      );
      starsParticleGroup.add(star);
    }
    root.add(starsParticleGroup);
  }

  root.position.y = 0;
  return { group: root, tailGroup, headGroup, earsGroup, wingsGroup, legs, starsParticleGroup };
}

/**
 * Creates Environment Props: Beautiful Picket Fences, Gates, Cozy Cottage, Stylized Trees, Beds
 */
export function createPropModel(type: string): THREE.Group {
  const root = new THREE.Group();
  root.name = `prop_${type}`;

  const woodMat = getMat('#a1887f', 0.75, 0.05);
  const darkWoodMat = getMat('#5d4037', 0.8, 0.05);
  const stoneMat = getMat('#90a4ae', 0.85, 0.05);
  const leafMat1 = getMat('#81c784', 0.75, 0.0);
  const leafMat2 = getMat('#4caf50', 0.8, 0.0);
  const blossomMat = getMat('#f48fb1', 0.7, 0.0);

  switch (type) {
    case 'fence': {
      // Beautiful wooden pasture picket fence with pointed posts & iron bolt accents
      [-0.9, 0.9].forEach((px) => {
        const post = new THREE.Mesh(geoCylinder, darkWoodMat);
        post.scale.set(0.14, 1.05, 0.14);
        post.position.set(px, 0.52, 0);
        post.castShadow = true;
        root.add(post);

        const cap = new THREE.Mesh(geoCone, darkWoodMat);
        cap.scale.set(0.16, 0.22, 0.16);
        cap.position.set(px, 1.12, 0);
        root.add(cap);
      });

      // Horizontal rails
      [0.38, 0.75].forEach((ry) => {
        const rail = new THREE.Mesh(geoBox, woodMat);
        rail.scale.set(1.9, 0.12, 0.08);
        rail.position.set(0, ry, 0);
        rail.castShadow = true;
        root.add(rail);
      });

      // Cute center vertical picket
      const picket = new THREE.Mesh(geoBox, woodMat);
      picket.scale.set(0.12, 0.85, 0.08);
      picket.position.set(0, 0.55, 0);
      root.add(picket);
      break;
    }

    case 'gate': {
      // Gate with brass latch & cross brace
      [-0.95, 0.95].forEach((px) => {
        const post = new THREE.Mesh(geoCylinder, darkWoodMat);
        post.scale.set(0.16, 1.15, 0.16);
        post.position.set(px, 0.57, 0);
        post.castShadow = true;
        root.add(post);
      });

      const gateFrame = new THREE.Mesh(geoBox, woodMat);
      gateFrame.scale.set(1.7, 0.75, 0.1);
      gateFrame.position.set(0, 0.55, 0);
      gateFrame.castShadow = true;
      root.add(gateFrame);

      // Gold latch
      const latch = new THREE.Mesh(geoDodeca, getMat('#ffd700', 0.25, 0.8));
      latch.scale.set(0.09, 0.09, 0.09);
      latch.position.set(0.68, 0.58, 0.08);
      root.add(latch);
      break;
    }

    case 'cottage_house': {
      // Cozy Sanctuary House with pitched pastel roof, timber beams, window shutters & flowerboxes
      const walls = new THREE.Mesh(geoBox, getMat('#fff9c4', 0.8, 0.05));
      walls.scale.set(4.4, 2.6, 3.6);
      walls.position.set(0, 1.3, 0);
      walls.castShadow = true;
      walls.receiveShadow = true;
      root.add(walls);

      // Roof (faceted terracotta eaves)
      const roof = new THREE.Mesh(geoCone, getMat('#e57373', 0.65, 0.0));
      roof.scale.set(3.8, 2.2, 3.2);
      roof.position.set(0, 3.6, 0);
      roof.rotation.y = Math.PI * 0.25;
      roof.castShadow = true;
      root.add(roof);

      // Stone chimney & volumetric smoke puff
      const chimney = new THREE.Mesh(geoBox, stoneMat);
      chimney.scale.set(0.65, 1.8, 0.65);
      chimney.position.set(1.4, 3.8, -0.8);
      chimney.castShadow = true;
      root.add(chimney);

      const smoke = new THREE.Mesh(geoDodeca, getMat('#ffffff', 0.9, 0.0, { transparent: true, opacity: 0.65 }));
      smoke.scale.set(0.4, 0.4, 0.4);
      smoke.position.set(1.4, 5.0, -0.8);
      root.add(smoke);

      // Cottage door
      const door = new THREE.Mesh(geoBox, darkWoodMat);
      door.scale.set(0.95, 1.65, 0.12);
      door.position.set(0, 0.82, 1.82);
      root.add(door);

      const knob = new THREE.Mesh(geoDodeca, getMat('#ffd700', 0.2, 0.8));
      knob.scale.set(0.06, 0.06, 0.06);
      knob.position.set(0.35, 0.85, 1.9);
      root.add(knob);

      // Window boxes with blooming flowers
      [-1.3, 1.3].forEach((wx) => {
        const win = new THREE.Mesh(geoBox, getMat('#81d4fa', 0.3, 0.4));
        win.scale.set(0.75, 0.75, 0.08);
        win.position.set(wx, 1.45, 1.82);
        root.add(win);

        const flowerBox = new THREE.Mesh(geoBox, darkWoodMat);
        flowerBox.scale.set(0.85, 0.18, 0.25);
        flowerBox.position.set(wx, 1.0, 1.92);
        root.add(flowerBox);

        for (let fl = -1; fl <= 1; fl++) {
          const bloom = new THREE.Mesh(geoDodeca, getMat(fl === 0 ? '#ff4081' : '#ffd54f', 0.5, 0.1));
          bloom.scale.set(0.12, 0.12, 0.12);
          bloom.position.set(wx + fl * 0.25, 1.15, 1.92);
          root.add(bloom);
        }
      });
      break;
    }

    case 'tree_oak': {
      // Beautiful faceted low-poly oak tree
      const trunk = new THREE.Mesh(geoCylinder, darkWoodMat);
      trunk.scale.set(0.38, 2.6, 0.38);
      trunk.position.set(0, 1.3, 0);
      trunk.castShadow = true;
      root.add(trunk);

      // Layered geometric cloud canopy
      const canopy1 = new THREE.Mesh(geoIcosa, leafMat1);
      canopy1.scale.set(1.6, 1.4, 1.6);
      canopy1.position.set(0, 2.9, 0);
      canopy1.castShadow = true;
      root.add(canopy1);

      const canopy2 = new THREE.Mesh(geoDodeca, leafMat2);
      canopy2.scale.set(1.2, 1.1, 1.2);
      canopy2.position.set(0.5, 3.6, 0.3);
      canopy2.castShadow = true;
      root.add(canopy2);
      break;
    }

    case 'tree_blossom': {
      // Pastel Sakura / Cherry Blossom Tree
      const trunk = new THREE.Mesh(geoCylinder, darkWoodMat);
      trunk.scale.set(0.32, 2.4, 0.32);
      trunk.position.set(0, 1.2, 0);
      trunk.castShadow = true;
      root.add(trunk);

      const canopy = new THREE.Mesh(geoIcosa, blossomMat);
      canopy.scale.set(1.7, 1.45, 1.7);
      canopy.position.set(0, 2.85, 0);
      canopy.castShadow = true;
      root.add(canopy);
      break;
    }

    case 'cozy_bed':
    case 'pet_bed': {
      // Plush donut bed
      const rim = new THREE.Mesh(geoCylinder, getMat('#f48fb1', 0.75, 0.0));
      rim.scale.set(0.95, 0.35, 0.95);
      rim.position.set(0, 0.18, 0);
      root.add(rim);

      const inner = new THREE.Mesh(geoCylinder, getMat('#ffffff', 0.95, 0.0));
      inner.scale.set(0.75, 0.26, 0.75);
      inner.position.set(0, 0.22, 0);
      root.add(inner);
      break;
    }

    case 'crystal_bed': {
      // Albino crystal bed with glowing gems
      const base = new THREE.Mesh(geoDodeca, getMat('#e0f7fa', 0.2, 0.6));
      base.scale.set(1.2, 0.35, 1.2);
      base.position.set(0, 0.18, 0);
      root.add(base);

      const crystalMat = getMat('#80deea', 0.15, 0.8, { emissive: '#00e5ff', emissiveIntensity: 0.45 });
      for (let c = 0; c < 4; c++) {
        const spike = new THREE.Mesh(geoCone, crystalMat);
        spike.scale.set(0.18, 0.55, 0.18);
        spike.position.set(
          c % 2 === 0 ? 0.65 : -0.65,
          0.45,
          c < 2 ? 0.65 : -0.65
        );
        root.add(spike);
      }
      break;
    }

    case 'scratch_tree': {
      const base = new THREE.Mesh(geoDodeca, woodMat);
      base.scale.set(0.9, 0.15, 0.9);
      base.position.set(0, 0.08, 0);
      root.add(base);

      const pole = new THREE.Mesh(geoCylinder, getMat('#d7ccc8', 0.85, 0));
      pole.scale.set(0.18, 1.6, 0.18);
      pole.position.set(0, 0.88, 0);
      root.add(pole);

      const top = new THREE.Mesh(geoDodeca, getMat('#f48fb1', 0.7, 0));
      top.scale.set(0.75, 0.15, 0.75);
      top.position.set(0, 1.7, 0);
      root.add(top);
      break;
    }

    case 'water_trough': {
      const trough = new THREE.Mesh(geoBox, woodMat);
      trough.scale.set(1.4, 0.5, 0.85);
      trough.position.set(0, 0.25, 0);
      root.add(trough);

      const water = new THREE.Mesh(geoBox, getMat('#4fc3f7', 0.15, 0.4, { transparent: true, opacity: 0.85 }));
      water.scale.set(1.25, 0.4, 0.7);
      water.position.set(0, 0.28, 0);
      root.add(water);
      break;
    }

    case 'food_bowl': {
      const bowl = new THREE.Mesh(geoCylinder, getMat('#ffca28', 0.3, 0.6));
      bowl.scale.set(0.48, 0.22, 0.48);
      bowl.position.set(0, 0.11, 0);
      root.add(bowl);

      const food = new THREE.Mesh(geoDodeca, getMat('#8d6e63', 0.8, 0));
      food.scale.set(0.38, 0.15, 0.38);
      food.position.set(0, 0.18, 0);
      root.add(food);
      break;
    }

    case 'play_ball': {
      const ball = new THREE.Mesh(
        geoIcosa,
        getMat('#ff4081', 0.25, 0.1, { emissive: '#f50057', emissiveIntensity: 0.15 })
      );
      ball.scale.set(0.32, 0.32, 0.32);
      ball.position.set(0, 0.32, 0);
      ball.castShadow = true;
      root.add(ball);

      // Star stripe accent on rubber ball
      const stripe = new THREE.Mesh(geoCylinder, getMat('#ffd54f', 0.3, 0.1));
      stripe.scale.set(0.33, 0.08, 0.33);
      stripe.position.set(0, 0.32, 0);
      root.add(stripe);
      break;
    }

    case 'signpost': {
      const post = new THREE.Mesh(geoBox, darkWoodMat);
      post.scale.set(0.18, 1.35, 0.18);
      post.position.set(0, 0.675, 0);
      post.castShadow = true;
      root.add(post);

      const title = (options && options.title) || 'Cercado dos Pets';
      const icon = (options && options.icon) || '🐾';
      const signTex = createSignpostTexture(title, icon);

      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.65,
        metalness: 0.05,
      });

      const boardGeo = new THREE.BoxGeometry(1.6, 0.8, 0.08);
      const boardMaterials = [
        woodMat, // right
        woodMat, // left
        woodMat, // top
        woodMat, // bottom
        signMat, // front (+Z)
        woodMat, // back (-Z)
      ];
      const board = new THREE.Mesh(boardGeo, boardMaterials);
      board.position.set(0, 1.25, 0.06);
      board.castShadow = true;
      root.add(board);

      (root as any).updateSign = (newTitle: string, newIcon: string) => {
        const newTex = createSignpostTexture(newTitle, newIcon);
        boardMaterials[4] = new THREE.MeshStandardMaterial({
          map: newTex,
          roughness: 0.65,
          metalness: 0.05,
        });
        board.material = boardMaterials;
      };
      break;
    }

    case 'flower_patch': {
      const colors = ['#ff80ab', '#ffd54f', '#80d8ff', '#b388ff'];
      for (let i = 0; i < 5; i++) {
        const ox = (Math.random() - 0.5) * 0.8;
        const oz = (Math.random() - 0.5) * 0.8;
        const stem = new THREE.Mesh(geoCylinder, leafMat1);
        stem.scale.set(0.03, 0.3, 0.03);
        stem.position.set(ox, 0.15, oz);
        root.add(stem);

        const bloom = new THREE.Mesh(geoDodeca, getMat(colors[i % colors.length], 0.5, 0.1));
        bloom.scale.set(0.14, 0.1, 0.14);
        bloom.position.set(ox, 0.32, oz);
        root.add(bloom);
      }
      break;
    }

    default: {
      const dummy = new THREE.Mesh(geoDodeca, woodMat);
      dummy.scale.set(0.5, 0.5, 0.5);
      dummy.position.set(0, 0.25, 0);
      root.add(dummy);
      break;
    }
  }

  return root;
}

/**
 * Creates dynamic canvas texture for customizable pen nameplates
 */
export function createSignpostTexture(text: string, icon: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Cute wooden board
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#d7ccc8';
  ctx.fillRect(16, 16, 480, 224);

  // Border
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, 480, 224);

  // Corner rivets
  ctx.fillStyle = '#ffb300';
  [
    [32, 32],
    [480, 32],
    [32, 224],
    [480, 224],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Icon
  ctx.font = '60px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon || '🐾', 256, 78);

  // Text title
  ctx.fillStyle = '#3e2723';
  ctx.font = 'bold 36px "Quicksand", sans-serif';
  ctx.fillText(text || 'Cercado dos Pets', 256, 165);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
