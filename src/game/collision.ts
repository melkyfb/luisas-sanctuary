/**
 * Collision System for Luisa's Magical Pet Sanctuary
 * Handles spatial collision queries and pushback for player, pets, fences, cottage, and trees.
 */

import * as THREE from 'three';

export interface CollisionCircle {
  id: string;
  x: number;
  z: number;
  radius: number;
  type: 'tree' | 'house_prop' | 'rock';
}

export interface CollisionBox {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  type: 'cottage' | 'fence';
  canPass?: boolean; // e.g. open gate
}

export class CollisionSystem {
  public circles: CollisionCircle[] = [];
  public boxes: CollisionBox[] = [];

  constructor() {}

  public clear() {
    this.circles = [];
    this.boxes = [];
  }

  public addCircle(id: string, x: number, z: number, radius: number, type: CollisionCircle['type'] = 'tree') {
    this.circles.push({ id, x, z, radius, type });
  }

  public addBox(id: string, minX: number, maxX: number, minZ: number, maxZ: number, type: CollisionBox['type'] = 'fence') {
    this.boxes.push({ id, minX, maxX, minZ, maxZ, type });
  }

  public removeById(id: string) {
    this.circles = this.circles.filter((c) => c.id !== id);
    this.boxes = this.boxes.filter((b) => b.id !== id);
  }

  /**
   * Resolves collision for a point moving with velocity and radius (Sliding Collision)
   */
  public resolveCollision(position: THREE.Vector3, radius: number = 0.5): boolean {
    let hasCollided = false;

    // 1. Circle obstacles (Trees, rocks)
    for (const circle of this.circles) {
      const dx = position.x - circle.x;
      const dz = position.z - circle.z;
      const distSq = dx * dx + dz * dz;
      const minDist = circle.radius + radius;

      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushZ = (dz / dist) * overlap;
        position.x += pushX;
        position.z += pushZ;
        hasCollided = true;
      }
    }

    // 2. Box obstacles (Cottage house, fences)
    for (const box of this.boxes) {
      if (box.canPass) continue;

      // Expand box by radius
      const bMinX = box.minX - radius;
      const bMaxX = box.maxX + radius;
      const bMinZ = box.minZ - radius;
      const bMaxZ = box.maxZ + radius;

      if (position.x > bMinX && position.x < bMaxX && position.z > bMinZ && position.z < bMaxZ) {
        // Find closest face to push out
        const leftPush = position.x - bMinX;
        const rightPush = bMaxX - position.x;
        const topPush = position.z - bMinZ;
        const bottomPush = bMaxZ - position.z;

        const minPush = Math.min(leftPush, rightPush, topPush, bottomPush);

        if (minPush === leftPush) {
          position.x = bMinX;
        } else if (minPush === rightPush) {
          position.x = bMaxX;
        } else if (minPush === topPush) {
          position.z = bMinZ;
        } else {
          position.z = bMaxZ;
        }
        hasCollided = true;
      }
    }

    // 3. World bounds pushback
    const mapLimit = 48.0;
    if (position.x < -mapLimit) { position.x = -mapLimit; hasCollided = true; }
    if (position.x > mapLimit) { position.x = mapLimit; hasCollided = true; }
    if (position.z < -mapLimit) { position.z = -mapLimit; hasCollided = true; }
    if (position.z > mapLimit) { position.z = mapLimit; hasCollided = true; }

    return hasCollided;
  }
}

export const collisionSystem = new CollisionSystem();
