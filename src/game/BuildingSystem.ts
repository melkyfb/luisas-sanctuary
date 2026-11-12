/**
 * Building, Fencing & Sanctuary Decoration Manager for Luisa's Magical Pet Sanctuary
 * Features:
 * - Mouse Ground Raycast with 2-meter Grid Snapping
 * - Drag-to-build / Paint Fences along mouse movement
 * - Instant Rotation (R key or Rotate button)
 * - Demolish Tool: Click any fence/decor to dismantle and return it to inventory!
 * - Real 2.5D Collision registration with collisionSystem
 */

import * as THREE from 'three';
import { PlacedStructure } from './types';
import { createPropModel } from './models';
import { soundManager } from './audio';
import { collisionSystem } from './collision';

export class BuildingSystem {
  public placedStructures: PlacedStructure[] = [];
  public fenceCount: number = 50; // Starts with 50 free fence segments
  public isBuildMode: boolean = false;
  public buildTool: 'place' | 'demolish' = 'place';
  public selectedItemType: string = 'fence';
  public previewGroup: THREE.Group | null = null;
  public previewRotation: number = 0;
  public hoveredGrid = { x: 0, z: 0 };
  public lastDrawnGrid = { x: 9999, z: 9999 };
  public isMouseDrawing = false;

  private scene: THREE.Scene | null = null;
  private nextId = 1;

  constructor() {}

  public init(scene: THREE.Scene) {
    this.scene = scene;
    this.createGhostPreview();
  }

  public setBuildMode(enabled: boolean, itemType = 'fence', tool: 'place' | 'demolish' = 'place') {
    this.isBuildMode = enabled;
    this.buildTool = tool;
    this.selectedItemType = itemType;
    if (this.previewGroup) {
      this.previewGroup.visible = enabled;
      this.updateGhostMesh();
    }
  }

  public setTool(tool: 'place' | 'demolish') {
    this.buildTool = tool;
    this.updateGhostMesh();
  }

  public setItemType(type: string) {
    this.selectedItemType = type;
    this.buildTool = 'place';
    this.updateGhostMesh();
  }

  public rotatePreview() {
    this.previewRotation = (this.previewRotation + Math.PI / 2) % (Math.PI * 2);
    if (this.previewGroup) {
      this.previewGroup.rotation.y = this.previewRotation;
    }
  }

  private createGhostPreview() {
    if (!this.scene) return;
    this.previewGroup = new THREE.Group();
    this.previewGroup.name = 'build_ghost_preview';
    this.previewGroup.visible = false;
    this.scene.add(this.previewGroup);
    this.updateGhostMesh();
  }

  private updateGhostMesh() {
    if (!this.previewGroup) return;

    // Clear old children
    while (this.previewGroup.children.length > 0) {
      this.previewGroup.remove(this.previewGroup.children[0]);
    }

    if (this.buildTool === 'demolish') {
      // Red demolition highlight box
      const redBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 1.2, 0.4),
        new THREE.MeshStandardMaterial({
          color: '#ff1744',
          transparent: true,
          opacity: 0.7,
          emissive: '#d50000',
          emissiveIntensity: 0.4,
        })
      );
      redBox.position.y = 0.6;
      this.previewGroup.add(redBox);
      return;
    }

    // Holographic green/cyan preview model
    const model = createPropModel(this.selectedItemType);
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#00e676',
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          emissive: '#00e676',
          emissiveIntensity: 0.35,
        });
      }
    });

    this.previewGroup.add(model);
    this.previewGroup.rotation.y = this.previewRotation;
  }

  /**
   * Updates preview position from raycasted ground coordinate with 2m grid snap
   */
  public updatePreviewFromGround(groundPoint: THREE.Vector3) {
    if (!this.previewGroup || !this.isBuildMode) return;

    // 2-meter grid snapping
    const snapX = Math.round(groundPoint.x / 2.0) * 2.0;
    const snapZ = Math.round(groundPoint.z / 2.0) * 2.0;

    this.hoveredGrid.x = snapX;
    this.hoveredGrid.z = snapZ;
    this.previewGroup.position.set(snapX, 0, snapZ);

    // If mouse is being held down in draw mode, auto-place connected fences as mouse moves!
    if (this.isMouseDrawing && this.buildTool === 'place' && this.selectedItemType === 'fence') {
      if (this.lastDrawnGrid.x !== snapX || this.lastDrawnGrid.z !== snapZ) {
        // Compute heading from previous point to auto-orient fence
        if (this.lastDrawnGrid.x !== 9999) {
          const dx = snapX - this.lastDrawnGrid.x;
          const dz = snapZ - this.lastDrawnGrid.z;
          if (Math.abs(dz) > Math.abs(dx)) {
            this.previewRotation = Math.PI / 2;
          } else {
            this.previewRotation = 0;
          }
          if (this.previewGroup) {
            this.previewGroup.rotation.y = this.previewRotation;
          }
        }
        this.placeItemAt(snapX, snapZ, this.previewRotation);
        this.lastDrawnGrid.x = snapX;
        this.lastDrawnGrid.z = snapZ;
      }
    }
  }

  /**
   * Fallback for player forward projection if mouse raycast is off
   */
  public updatePreviewFromPlayer(playerPos: THREE.Vector3, playerRotY: number) {
    if (!this.previewGroup || !this.isBuildMode) return;
    const forwardX = Math.sin(playerRotY) * 2.5;
    const forwardZ = Math.cos(playerRotY) * 2.5;
    const snapX = Math.round((playerPos.x + forwardX) / 2.0) * 2.0;
    const snapZ = Math.round((playerPos.z + forwardZ) / 2.0) * 2.0;
    this.hoveredGrid.x = snapX;
    this.hoveredGrid.z = snapZ;
    this.previewGroup.position.set(snapX, 0, snapZ);
  }

  /**
   * Places the currently selected item at a specific coordinate
   */
  public placeItemAt(x: number, z: number, rotation: number = this.previewRotation): boolean {
    if (!this.scene || !this.isBuildMode) return false;

    if (this.selectedItemType === 'fence' && this.fenceCount <= 0) {
      return false; // Out of fences!
    }

    // Check if duplicate piece is already at this exact spot
    const existing = this.placedStructures.find(
      (s) => Math.hypot(s.position.x - x, s.position.z - z) < 0.8
    );
    if (existing) {
      return false;
    }

    const mesh = createPropModel(this.selectedItemType);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = rotation;
    this.scene.add(mesh);

    const structId = `struct_${this.nextId++}`;
    const placed: PlacedStructure = {
      id: structId,
      type: this.selectedItemType,
      category: this.selectedItemType.includes('fence')
        ? 'fence'
        : this.selectedItemType === 'gate'
        ? 'gate'
        : 'furniture',
      position: { x, y: 0, z },
      rotation: rotation,
      mesh,
      signData:
        this.selectedItemType === 'signpost'
          ? { title: 'Cercado Fofo', icon: '🐾' }
          : undefined,
    };

    this.placedStructures.push(placed);

    // Register 2.5D solid collision in collisionSystem!
    if (this.selectedItemType === 'fence') {
      this.fenceCount = Math.max(0, this.fenceCount - 1);
      const isVertical = Math.abs(Math.sin(rotation)) > 0.5;
      if (isVertical) {
        collisionSystem.addBox(structId, x - 0.2, x + 0.2, z - 1.0, z + 1.0, 'fence');
      } else {
        collisionSystem.addBox(structId, x - 1.0, x + 1.0, z - 0.2, z + 0.2, 'fence');
      }
    } else if (this.selectedItemType === 'gate') {
      // Gates block by default or can pass
      const isVertical = Math.abs(Math.sin(rotation)) > 0.5;
      if (isVertical) {
        collisionSystem.addBox(structId, x - 0.2, x + 0.2, z - 1.0, z + 1.0, 'fence');
      } else {
        collisionSystem.addBox(structId, x - 1.0, x + 1.0, z - 0.2, z + 0.2, 'fence');
      }
    } else {
      // Furniture circular collision (beds, water troughs)
      collisionSystem.addCircle(structId, x, z, 0.7, 'house_prop');
    }

    soundManager.playPlace();
    return true;
  }

  public placeItem(): boolean {
    if (!this.previewGroup) return false;
    return this.placeItemAt(
      this.previewGroup.position.x,
      this.previewGroup.position.z,
      this.previewRotation
    );
  }

  /**
   * Destroys the nearest structure and REFUNDS IT back into the player's inventory!
   */
  public demolishAt(x: number, z: number, maxDist = 2.2): boolean {
    if (!this.scene) return false;

    let nearestIdx = -1;
    let minD = maxDist;

    this.placedStructures.forEach((s, idx) => {
      const d = Math.hypot(s.position.x - x, s.position.z - z);
      if (d < minD) {
        minD = d;
        nearestIdx = idx;
      }
    });

    if (nearestIdx >= 0) {
      const removed = this.placedStructures.splice(nearestIdx, 1)[0];
      if (removed.mesh) {
        this.scene.remove(removed.mesh);
      }

      // Remove from collision system
      collisionSystem.removeById(removed.id);

      // Refund back into inventory!
      if (removed.type === 'fence') {
        this.fenceCount++;
      }

      soundManager.playClick();
      return true;
    }
    return false;
  }

  public updatePreviewPosition(playerPos: THREE.Vector3, playerRotY: number) {
    this.updatePreviewFromPlayer(playerPos, playerRotY);
  }

  public removeNearest(playerPos: THREE.Vector3): boolean {
    return this.demolishAt(playerPos.x, playerPos.z, 3.0);
  }

  public getNearbySignpost(pos: { x: number; z: number }, maxDist = 2.5): PlacedStructure | null {
    let nearest: PlacedStructure | null = null;
    let minD = maxDist;

    for (const s of this.placedStructures) {
      if (s.type === 'signpost') {
        const d = Math.hypot(s.position.x - pos.x, s.position.z - pos.z);
        if (d < minD) {
          minD = d;
          nearest = s;
        }
      }
    }
    return nearest;
  }

  public updateSignpost(id: string, title: string, icon: string): boolean {
    const struct = this.placedStructures.find((s) => s.id === id);
    if (struct && struct.mesh && typeof struct.mesh.updateSign === 'function') {
      struct.signData = { title, icon };
      struct.mesh.updateSign(title, icon);
      soundManager.playPlace();
      return true;
    }
    return false;
  }
}

export const buildingSystem = new BuildingSystem();
