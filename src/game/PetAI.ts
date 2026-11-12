/**
 * Pet AI State Machine & Sanctuary Logic for Luisa's Magical Pet Sanctuary
 */

import * as THREE from 'three';
import { PetAIState, PetData, SpeciesId, PetRarity, SPECIES_CATALOG, WeatherType } from './types';
import { soundManager } from './audio';
import { collisionSystem } from './collision';

export interface PetInstance {
  data: PetData;
  group: THREE.Group;
  tailGroup?: THREE.Group;
  headGroup?: THREE.Group;
  earsGroup?: THREE.Group;
  wingsGroup?: THREE.Group;
  legs: THREE.Group[];
  starsParticleGroup?: THREE.Group;

  // Animation & AI variables
  targetPos: THREE.Vector3;
  velocity: THREE.Vector3;
  idleTimer: number;
  walkCycle: number;
  bobbleCycle: number;
  isFleeing: boolean;
  alertTimer: number;
  heartParticles: THREE.Group;
  weatherShakeTimer: number;
  isShaking: boolean;
  shakeTimeLeft: number;
  isCozyResting: boolean;
}

export class PetManager {
  public pets: PetInstance[] = [];
  private nextId = 1;

  constructor() {}

  /**
   * Spawns a pet in the world
   */
  public spawnPet(
    species: SpeciesId,
    variant: PetRarity,
    x: number,
    z: number,
    isAdopted = false
  ): PetData {
    const catalog = SPECIES_CATALOG[species];
    const data: PetData = {
      id: `pet_${this.nextId++}_${species}`,
      name: `${catalog.name} #${this.nextId}`,
      species,
      variant,
      isAdopted,
      state: isAdopted ? 'TAMED_DOMESTIC' : 'WILD_ROAM',
      tameStage: isAdopted ? 4 : 0,
      position: { x, y: 0, z },
      rotation: Math.random() * Math.PI * 2,
      care: {
        hunger: 80,
        cleanliness: 85,
        happiness: 90,
        groomed: true,
        lastCareTime: Date.now(),
      },
      favoriteFood: catalog.treatName,
      personality: this.getRandomPersonality(species),
    };

    return data;
  }

  private getRandomPersonality(species: SpeciesId): string {
    const traits = [
      'Playful & bubbly',
      'Curious explorer',
      'Gentle & snuggly',
      'Loves head scratches',
      'Sunbeam sleeper',
      'Bouncy adventurer',
    ];
    return traits[Math.floor(Math.random() * traits.length)];
  }

  /**
   * Updates all active pets every frame with weather reactions
   */
  public update(
    dt: number,
    playerPosition: THREE.Vector3,
    isPlayerRunning: boolean,
    weather: WeatherType = 'sunny',
    onPetHeartSpawn?: (pos: THREE.Vector3) => void
  ) {
    const clampedDt = Math.min(dt, 0.05);

    // Weather modifiers for activity and animation
    let speedMult = 1.0;
    let walkAnimSpeed = 8;
    let wanderFreqMin = 3;
    let wanderFreqMax = 6;

    if (weather === 'sunny') {
      speedMult = 1.25; // Energetic, fast sunny trot
      walkAnimSpeed = 10;
      wanderFreqMin = 2.5;
      wanderFreqMax = 5.0;
    } else if (weather === 'rainy') {
      speedMult = 0.72; // Cautious, cozy slower trot
      walkAnimSpeed = 6;
      wanderFreqMin = 4.5;
      wanderFreqMax = 8.0;
    } else if (weather === 'snowy') {
      speedMult = 0.88; // Playful snow bouncy hops
      walkAnimSpeed = 7.5;
      wanderFreqMin = 3.5;
      wanderFreqMax = 7.0;
    }

    for (const pet of this.pets) {
      const pData = pet.data;
      const mesh = pet.group;
      const distToPlayer = mesh.position.distanceTo(playerPosition);

      pet.walkCycle += clampedDt * walkAnimSpeed;
      pet.bobbleCycle += clampedDt * 4;

      // Weather-Specific Body Shake Effect (e.g. shaking off raindrops or snowflakes)
      pet.weatherShakeTimer -= clampedDt;
      if (pet.weatherShakeTimer <= 0) {
        if (weather === 'rainy' || weather === 'snowy') {
          // Trigger cute doggy/kitty shake
          pet.isShaking = true;
          pet.shakeTimeLeft = 0.65;
          soundManager.playPetShake();
        }
        pet.weatherShakeTimer = 10 + Math.random() * 15;
      }

      if (pet.isShaking) {
        pet.shakeTimeLeft -= clampedDt;
        // Rapid twist oscillation
        const shakeTwist = Math.sin(pet.shakeTimeLeft * 38) * 0.35;
        mesh.rotation.y = pData.rotation + shakeTwist;
        if (pet.headGroup) {
          pet.headGroup.rotation.z = -shakeTwist * 1.2;
        }
        if (pet.tailGroup) {
          pet.tailGroup.rotation.y = shakeTwist * 2;
        }

        if (pet.shakeTimeLeft <= 0) {
          pet.isShaking = false;
          mesh.rotation.y = pData.rotation;
        }
        continue; // Pause other movement while shaking
      }

      // Subtle celestial star spin
      if (pet.starsParticleGroup) {
        pet.starsParticleGroup.rotation.y += clampedDt * 2;
      }

      // Wing flapping if winged
      if (pet.wingsGroup) {
        const flapMult = weather === 'sunny' ? 3.0 : 1.8;
        const flap = Math.sin(pet.walkCycle * flapMult) * 0.4;
        pet.wingsGroup.children[0].rotation.z = -0.4 + flap;
        pet.wingsGroup.children[1].rotation.z = 0.4 - flap;
      }

      // Tail wagging (Faster & more enthusiastic in sunny weather)
      if (pet.tailGroup) {
        const tailRate = weather === 'sunny' ? 4.0 : (weather === 'rainy' ? 1.8 : 2.5);
        const tailAmp = weather === 'sunny' ? 0.6 : (weather === 'rainy' ? 0.25 : 0.4);
        pet.tailGroup.rotation.y = Math.sin(pet.walkCycle * tailRate) * tailAmp;
      }

      // Pet AI State Machine
      switch (pData.state) {
        case 'WILD_ROAM': {
          // If player rushes too close without calling, wild pet startles and flees!
          if (!pData.isAdopted && distToPlayer < 3.2 && isPlayerRunning) {
            pData.state = 'SKITTISH_FLEE';
            pet.alertTimer = 2.5;

            // Flee direction away from player
            const fleeDir = new THREE.Vector3()
              .subVectors(mesh.position, playerPosition)
              .normalize();
            pet.targetPos.copy(mesh.position).addScaledVector(fleeDir, 8 + Math.random() * 4);
            // Keep in bounds
            pet.targetPos.x = THREE.MathUtils.clamp(pet.targetPos.x, -45, 45);
            pet.targetPos.z = THREE.MathUtils.clamp(pet.targetPos.z, -45, 45);
            break;
          }

          // Peaceful wander
          pet.idleTimer -= clampedDt;
          if (pet.idleTimer <= 0) {
            pet.idleTimer = wanderFreqMin + Math.random() * (wanderFreqMax - wanderFreqMin);
            // Pick a nearby destination
            const wanderAngle = Math.random() * Math.PI * 2;
            const wanderDist = 3 + Math.random() * 5;
            pet.targetPos.set(
              mesh.position.x + Math.cos(wanderAngle) * wanderDist,
              0,
              mesh.position.z + Math.sin(wanderAngle) * wanderDist
            );
            // Constrain
            pet.targetPos.x = THREE.MathUtils.clamp(pet.targetPos.x, -45, 45);
            pet.targetPos.z = THREE.MathUtils.clamp(pet.targetPos.z, -45, 45);
          }

          this.moveTowards(mesh, pet.targetPos, 1.2 * speedMult * clampedDt, pet.legs, pet.walkCycle, weather);
          break;
        }

        case 'SKITTISH_FLEE': {
          pet.alertTimer -= clampedDt;
          // Run quickly away
          this.moveTowards(mesh, pet.targetPos, 3.8 * speedMult * clampedDt, pet.legs, pet.walkCycle * 2, weather);

          if (pet.alertTimer <= 0 || mesh.position.distanceTo(pet.targetPos) < 1.0) {
            pData.state = 'WILD_ROAM';
            pet.idleTimer = 4.0;
          }
          break;
        }

        case 'CURIOUS_CALLED': {
          // Turn to face player, tilt head in curiosity
          this.turnTowards(mesh, playerPosition, clampedDt * 5);
          if (pet.headGroup) {
            pet.headGroup.rotation.z = Math.sin(pet.bobbleCycle) * 0.2;
          }

          // If player moves far away, revert to wild roam
          if (distToPlayer > 18) {
            pData.state = 'WILD_ROAM';
          }
          break;
        }

        case 'APPROACHING_FOOD': {
          // Approach player slowly and gently
          this.turnTowards(mesh, playerPosition, clampedDt * 4);
          if (distToPlayer > 2.0) {
            const treatTarget = new THREE.Vector3().lerpVectors(mesh.position, playerPosition, 0.4);
            this.moveTowards(mesh, treatTarget, 1.6 * speedMult * clampedDt, pet.legs, pet.walkCycle, weather);
          } else {
            // Reached player, ready for petting!
            pData.state = 'BEING_PET';
            soundManager.playFeed();
          }
          break;
        }

        case 'BEING_PET': {
          // Look at player, wag tail vigorously, emit hearts
          this.turnTowards(mesh, playerPosition, clampedDt * 4);
          if (pet.tailGroup) {
            pet.tailGroup.rotation.y = Math.sin(pet.walkCycle * 4) * 0.6;
          }
          if (pet.headGroup) {
            pet.headGroup.position.y = 0.42 + Math.sin(pet.bobbleCycle * 2) * 0.05;
          }

          // Subtle bounce
          mesh.position.y = Math.abs(Math.sin(pet.bobbleCycle * 2)) * 0.1;
          break;
        }

        case 'TAMED_DOMESTIC': {
          // Domestic sanctuary pet behavior
          pet.idleTimer -= clampedDt;
          if (pet.idleTimer <= 0) {
            pet.idleTimer = wanderFreqMin + Math.random() * (wanderFreqMax - wanderFreqMin);
            const roll = Math.random();

            if (roll < 0.35 && distToPlayer < 12) {
              // Wander near player
              pet.targetPos.set(
                playerPosition.x + (Math.random() - 0.5) * 6,
                0,
                playerPosition.z + (Math.random() - 0.5) * 6
              );
            } else if (roll < 0.6) {
              // Small wander
              const a = Math.random() * Math.PI * 2;
              const d = 2 + Math.random() * 4;
              pet.targetPos.set(
                mesh.position.x + Math.cos(a) * d,
                0,
                mesh.position.z + Math.sin(a) * d
              );
            }
            // Keep in bounds
            pet.targetPos.x = THREE.MathUtils.clamp(pet.targetPos.x, -45, 45);
            pet.targetPos.z = THREE.MathUtils.clamp(pet.targetPos.z, -45, 45);
          }

          // Move if not at target
          if (mesh.position.distanceTo(pet.targetPos) > 0.5) {
            this.moveTowards(mesh, pet.targetPos, 1.4 * speedMult * clampedDt, pet.legs, pet.walkCycle, weather);
          } else {
            // Settle legs
            pet.legs.forEach((l) => (l.rotation.x = 0));
            // In snow or rain, domestic pets take cozy pauses (curl slightly)
            if (weather === 'snowy' || weather === 'rainy') {
              mesh.position.y = 0;
            }
          }
          break;
        }

        case 'CHASING_BALL': {
          // Pet is sprinting excitedly towards the thrown ball!
          this.turnTowards(mesh, pet.targetPos, clampedDt * 10);
          if (pet.tailGroup) {
            pet.tailGroup.rotation.y = Math.sin(pet.walkCycle * 6) * 0.85;
          }
          this.moveTowards(mesh, pet.targetPos, 4.5 * clampedDt, pet.legs, pet.walkCycle * 1.6, weather);
          break;
        }

        case 'RETURNING_BALL': {
          // Pet carrying ball back to player with proud trot!
          this.turnTowards(mesh, playerPosition, clampedDt * 10);
          if (pet.tailGroup) {
            pet.tailGroup.rotation.y = Math.sin(pet.walkCycle * 6) * 0.85;
          }
          this.moveTowards(mesh, playerPosition, 3.5 * clampedDt, pet.legs, pet.walkCycle * 1.3, weather);
          break;
        }
      }

      // 2.5D Obstacle Collision (Fences, House, Trees)
      collisionSystem.resolveCollision(mesh.position, 0.42);

      // Sync position to data
      pData.position.x = mesh.position.x;
      pData.position.y = mesh.position.y;
      pData.position.z = mesh.position.z;
      pData.rotation = mesh.rotation.y;
    }
  }

  private moveTowards(
    mesh: THREE.Group,
    target: THREE.Vector3,
    speed: number,
    legs: THREE.Group[],
    walkCycle: number,
    weather: WeatherType = 'sunny'
  ) {
    const toTarget = new THREE.Vector3().subVectors(target, mesh.position);
    toTarget.y = 0;
    const dist = toTarget.length();

    if (dist > 0.1) {
      toTarget.normalize();
      mesh.position.addScaledVector(toTarget, Math.min(speed, dist));

      // Rotate smoothly towards movement
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);
      mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, targetAngle, 8, 0.03);

      // Weather-Specific Gait & Bounce
      if (weather === 'snowy') {
        // High bouncy snow hops over powder snow
        mesh.position.y = Math.abs(Math.sin(walkCycle)) * 0.22;
      } else if (weather === 'sunny') {
        // Joyful energetic trot
        mesh.position.y = Math.abs(Math.sin(walkCycle)) * 0.08;
      } else {
        // Rainy: low crouched careful footing
        mesh.position.y = 0;
      }

      // Animate legs with weather-adjusted swing amplitude
      if (legs && legs.length >= 4) {
        const swingAmp = weather === 'sunny' ? 0.55 : (weather === 'rainy' ? 0.32 : 0.48);
        const legSwing = Math.sin(walkCycle) * swingAmp;
        legs[0].rotation.x = legSwing;
        legs[1].rotation.x = -legSwing;
        legs[2].rotation.x = -legSwing;
        legs[3].rotation.x = legSwing;
      }
    } else {
      // Idle pose
      mesh.position.y = 0;
      if (legs) {
        legs.forEach((l) => (l.rotation.x = 0));
      }
    }
  }

  private turnTowards(mesh: THREE.Group, target: THREE.Vector3, dampSpeed: number) {
    const dir = new THREE.Vector3().subVectors(target, mesh.position);
    dir.y = 0;
    if (dir.lengthSq() > 0.01) {
      dir.normalize();
      const targetAngle = Math.atan2(dir.x, dir.z);
      mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, targetAngle, dampSpeed, 0.03);
    }
  }

  /**
   * Finds the closest wild or domestic pet to the player
   */
  public getClosestPet(playerPosition: THREE.Vector3, maxDist = 15): PetInstance | null {
    let closest: PetInstance | null = null;
    let minD = maxDist;

    for (const pet of this.pets) {
      const d = pet.group.position.distanceTo(playerPosition);
      if (d < minD) {
        minD = d;
        closest = pet;
      }
    }
    return closest;
  }
}

export const petManager = new PetManager();
