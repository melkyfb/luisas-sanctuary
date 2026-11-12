/**
 * Core 3D Game Engine for Luisa's Magical Pet Sanctuary
 * Powered by Three.js with RoomEnvironment, PBR materials, procedural models,
 * isometric 360 orbital camera, and mobile + desktop controls.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CostumeId,
  Gender,
  HairColor,
  HairStyle,
  PetData,
  PetRarity,
  PlayerCustomization,
  SpeciesId,
  SPECIES_CATALOG,
  WeatherType,
} from './types';
import { createAnimalModel, createPlayerModel, createPropModel } from './models';
import { petManager, PetInstance } from './PetAI';
import { buildingSystem } from './BuildingSystem';
import { soundManager } from './audio';
import { collisionSystem } from './collision';

// Pre-allocated reusable math vectors (Zero GC in loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _dummyObject = new THREE.Object3D();

export class GameEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public isSoftwareGl: boolean = false;

  // Player state
  public playerCustomization: PlayerCustomization = {
    name: 'Luisa',
    gender: 'girl',
    hairColor: 'dark_brown',
    hairStyle: 'pigtails',
    costume: 'default_adventurer',
  };
  public playerGroup: THREE.Group | null = null;
  public playerPos = new THREE.Vector3(0, 0, 0);
  public playerRotY = 0;
  public playerVelocity = new THREE.Vector3();
  private playerAnimRefs: any = null;
  private playerWalkCycle = 0;
  public isPlayerRunning = false;

  // Camera Orbit & Zoom
  public cameraAngle = Math.PI * 0.25; // 45 deg isometric
  public cameraPitch = 0.65; // ~37 deg above horizon
  public cameraDistance = 18.0; // Zoom distance (8 to 32)
  public cameraTarget = new THREE.Vector3(0, 0, 0);
  private isOrbiting = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Controls input
  public keysHeld: Record<string, boolean> = {};
  public joystickVec = { x: 0, y: 0 };

  // Particles
  private heartParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private particleGroup = new THREE.Group();

  // Wand Beam Effect
  private wandBeam: THREE.Line | null = null;
  private wandBeamTimer = 0;

  // Lighting & Day/Night
  private dirLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  public timeOfDay = 10; // 0 to 24 (10 is bright pleasant morning)
  private daySpeed = 0.04;

  // Animation Frame
  private frameId = 0;
  private clock = new THREE.Clock();
  private isDestroyed = false;

  // Weather System
  public currentWeather: WeatherType = 'sunny';
  private weatherTimer = 45.0;
  private weatherCycleIndex = 0;
  private rainMesh: THREE.InstancedMesh | null = null;
  private rainPositions: Float32Array | null = null;
  private snowMesh: THREE.InstancedMesh | null = null;
  private snowPositions: Float32Array | null = null;
  private sunSparkleMesh: THREE.InstancedMesh | null = null;
  private sunPositions: Float32Array | null = null;
  private groundMat: THREE.MeshStandardMaterial | null = null;
  private weatherParticleTime = 0;

  // Raycasting & Grid Placement
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private groundIntersection = new THREE.Vector3();

  // Fetch Ball System
  public fetchBall: {
    mesh: THREE.Group;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    state: 'THROWN' | 'BOUNCING' | 'IDLE' | 'CARRIED';
    carrierPet: PetInstance | null;
  } | null = null;

  // Callbacks
  public onPetSelected?: (pet: PetData | null) => void;
  public onAdoptSuccess?: (pet: PetData) => void;
  public onLoveGained?: (amount: number) => void;
  public onWeatherChange?: (weather: WeatherType) => void;
  public onFetchSuccess?: () => void;
  public onEditSignpost?: (sign: { id: string; title: string; icon: string }) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e0f7fa');
    this.scene.fog = new THREE.Fog('#e0f7fa', 28, 65);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.5,
      120
    );

    // 4. RoomEnvironment for Studio PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lights
    this.setupLighting();

    // 6. Terrain & Sanctuary World
    this.setupTerrain();
    this.setupCottageAndPens();

    // 7. Systems & Groups
    this.scene.add(this.particleGroup);
    buildingSystem.init(this.scene);
    this.setupWeatherParticles();

    // 8. Player Setup
    this.rebuildPlayer();

    // 9. Initial Pets
    this.spawnInitialAnimals();

    // 10. Listeners
    this.bindInputs();

    // 11. Start Loop
    this.clock.start();
    this.startLoop();
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight('#ffffff', '#b9f6ca', 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight('#fff9c4', 1.8);
    this.dirLight.position.set(20, 35, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 70;
      const d = 26;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);
  }

  private setupTerrain() {
    // Soft lush green terrain with cute pastel patches
    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    // Procedural gentle undulations
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Keep sanctuary center level
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 15) {
        const bump = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.7;
        posAttr.setY(i, bump);
      }
    }
    groundGeo.computeVertexNormals();

    this.groundMat = new THREE.MeshStandardMaterial({
      color: '#a7d97b', // Soft pastel meadow green
      roughness: 0.9,
      metalness: 0.02,
    });
    const groundMesh = new THREE.Mesh(groundGeo, this.groundMat);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Cobblestone path from house into yard
    const pathMat = new THREE.MeshStandardMaterial({
      color: '#e0d6c8',
      roughness: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    for (let p = 0; p < 12; p++) {
      const stone = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.2), pathMat);
      stone.position.set((Math.random() - 0.5) * 0.3, 0.02, 3.5 + p * 1.3);
      stone.rotation.y = (Math.random() - 0.5) * 0.2;
      this.scene.add(stone);
    }

    // Sparkling sanctuary pond
    const pondGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.3, 20);
    const pondMat = new THREE.MeshStandardMaterial({
      color: '#80deea',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(16, 0.05, -12);
    this.scene.add(pond);

    // Lotus pads in pond
    const padMat = new THREE.MeshStandardMaterial({ color: '#4caf50', roughness: 0.8 });
    for (let lp = 0; lp < 3; lp++) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 10), padMat);
      pad.position.set(16 + (Math.random() - 0.5) * 4, 0.22, -12 + (Math.random() - 0.5) * 4);
      this.scene.add(pad);
    }

    // Scattered natural forest perimeter (blossom and oak trees, flowers, mushrooms)
    const treePositions = [
      { x: -14, z: -10, type: 'tree_oak' },
      { x: -18, z: 2, type: 'tree_blossom' },
      { x: -22, z: -16, type: 'tree_oak' },
      { x: -8, z: -20, type: 'tree_blossom' },
      { x: 10, z: -22, type: 'tree_oak' },
      { x: 22, z: -4, type: 'tree_blossom' },
      { x: 20, z: 12, type: 'tree_oak' },
      { x: 14, z: 24, type: 'tree_blossom' },
      { x: -12, z: 18, type: 'tree_oak' },
      { x: -25, z: 12, type: 'tree_blossom' },
      { x: 0, z: -26, type: 'tree_oak' },
    ];

    treePositions.forEach((tp) => {
      const tree = createPropModel(tp.type);
      tree.position.set(tp.x, 0, tp.z);
      const s = 0.85 + Math.random() * 0.3;
      tree.scale.set(s, s, s);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
      collisionSystem.addCircle(`tree_${tp.x}_${tp.z}`, tp.x, tp.z, 0.85, 'tree');
    });

    // Flower clusters
    for (let f = 0; f < 25; f++) {
      const flower = createPropModel('flower_patch');
      const angle = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 32;
      flower.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      this.scene.add(flower);
    }
  }

  private setupCottageAndPens() {
    // Cozy Sanctuary House at (0, 0, 0) facing forward (+Z)
    const house = createPropModel('cottage_house');
    house.position.set(0, 0, 0);
    this.scene.add(house);
    // Solid cottage walls collision
    collisionSystem.addBox('cottage_house', -2.3, 2.3, -1.9, 1.9, 'cottage');

    // Initial Starter Pen #1 (Play Pen with cozy beds & ball)
    const pen1Coords = [
      // Left wall
      { x: -8, z: 6, rot: Math.PI / 2 },
      { x: -8, z: 8, rot: Math.PI / 2 },
      { x: -8, z: 10, rot: Math.PI / 2 },
      // Bottom wall
      { x: -7, z: 11, rot: 0 },
      { x: -5, z: 11, rot: 0 },
      { x: -3, z: 11, rot: 0 },
      // Right wall
      { x: -2, z: 10, rot: Math.PI / 2 },
      { x: -2, z: 8, rot: Math.PI / 2 },
      { x: -2, z: 6, rot: Math.PI / 2 },
    ];

    pen1Coords.forEach((p, idx) => {
      const fence = createPropModel('fence');
      fence.position.set(p.x, 0, p.z);
      fence.rotation.y = p.rot;
      this.scene.add(fence);
      const isVertical = Math.abs(Math.sin(p.rot)) > 0.5;
      if (isVertical) {
        collisionSystem.addBox(`starter_fence_${idx}`, p.x - 0.2, p.x + 0.2, p.z - 1.0, p.z + 1.0, 'fence');
      } else {
        collisionSystem.addBox(`starter_fence_${idx}`, p.x - 1.0, p.x + 1.0, p.z - 0.2, p.z + 0.2, 'fence');
      }
    });

    // Gate on front
    const gate = createPropModel('gate');
    gate.position.set(-5, 0, 5);
    this.scene.add(gate);

    // Cozy items inside pen 1
    const bed = createPropModel('cozy_bed');
    bed.position.set(-6.5, 0, 8.5);
    this.scene.add(bed);

    const water = createPropModel('water_trough');
    water.position.set(-3.5, 0, 9);
    this.scene.add(water);

    const ball = createPropModel('play_ball');
    ball.position.set(-5, 0, 7.5);
    this.scene.add(ball);
  }

  private spawnInitialAnimals() {
    // Species and variants placed naturally around the sanctuary meadow and pens
    const initialList: { species: SpeciesId; variant: PetRarity; x: number; z: number; isAdopted?: boolean }[] = [
      // Starter adopted pet welcoming Luisa!
      { species: 'puppy', variant: 'normal', x: -5, z: 7.5, isAdopted: true },
      // Friendly kitten near cottage porch
      { species: 'kitten', variant: 'normal', x: 2.5, z: 3.5, isAdopted: true },
      // Wild magical pets waiting in the enchanted forest
      { species: 'unicorn', variant: 'albino', x: 18, z: -8 }, // Rare Albino Unicorn!
      { species: 'bunny', variant: 'rainbow', x: -12, z: 4 }, // Rainbow Bunny
      { species: 'fox', variant: 'melanistic', x: 12, z: 15 }, // Obsidian Fox
      { species: 'bear', variant: 'normal', x: -16, z: -14 }, // Gentle Honey Bear
      { species: 'cat', variant: 'winged', x: 8, z: -15 }, // Winged Cat
      { species: 'dog', variant: 'celestial', x: -18, z: 16 }, // Celestial Star Dog
    ];

    initialList.forEach((spec) => {
      const data = petManager.spawnPet(spec.species, spec.variant, spec.x, spec.z, !!spec.isAdopted);
      const model = createAnimalModel(spec.species, spec.variant);
      model.group.position.set(spec.x, 0, spec.z);
      this.scene.add(model.group);

      const instance: PetInstance = {
        data,
        group: model.group,
        tailGroup: model.tailGroup,
        headGroup: model.headGroup,
        earsGroup: model.earsGroup,
        wingsGroup: model.wingsGroup,
        legs: model.legs,
        starsParticleGroup: model.starsParticleGroup,
        targetPos: new THREE.Vector3(spec.x, 0, spec.z),
        velocity: new THREE.Vector3(),
        idleTimer: 2 + Math.random() * 3,
        walkCycle: Math.random() * 10,
        bobbleCycle: Math.random() * 10,
        isFleeing: false,
        alertTimer: 0,
        heartParticles: new THREE.Group(),
        weatherShakeTimer: 10 + Math.random() * 15,
        isShaking: false,
        shakeTimeLeft: 0,
        isCozyResting: false,
      };

      petManager.pets.push(instance);
    });
  }

  public rebuildPlayer() {
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }

    const { group, leftLeg, rightLeg, leftArm, rightArm, headGroup, wandProp } = createPlayerModel(
      this.playerCustomization.gender,
      this.playerCustomization.hairColor,
      this.playerCustomization.hairStyle,
      this.playerCustomization.costume
    );

    this.playerGroup = group;
    this.playerGroup.position.copy(this.playerPos);
    this.playerGroup.rotation.y = this.playerRotY;
    this.scene.add(this.playerGroup);

    this.playerAnimRefs = { leftLeg, rightLeg, leftArm, rightArm, headGroup, wandProp };
  }

  public updateCustomization(customization: Partial<PlayerCustomization>) {
    this.playerCustomization = { ...this.playerCustomization, ...customization };
    this.rebuildPlayer();
  }

  // Taming Actions
  public callPet(): PetData | null {
    soundManager.playCall();

    // Spawn cute sound ripple / rings around player
    this.spawnRipple(this.playerPos);

    const closest = petManager.getClosestPet(this.playerPos, 14);
    if (closest && !closest.data.isAdopted) {
      closest.data.state = 'CURIOUS_CALLED';
      closest.data.tameStage = Math.max(closest.data.tameStage, 1);
      this.spawnHearts(closest.group.position, 3);
      if (this.onPetSelected) this.onPetSelected(closest.data);
      return closest.data;
    }
    return null;
  }

  public feedPet(petId?: string): boolean {
    const pet = petId
      ? petManager.pets.find((p) => p.data.id === petId)
      : petManager.getClosestPet(this.playerPos, 5);

    if (pet) {
      soundManager.playFeed();
      pet.data.state = 'APPROACHING_FOOD';
      pet.data.tameStage = Math.max(pet.data.tameStage, 2);
      pet.data.care.hunger = Math.min(100, pet.data.care.hunger + 35);
      this.spawnHearts(pet.group.position, 5);
      if (this.onPetSelected) this.onPetSelected(pet.data);
      if (this.onLoveGained) this.onLoveGained(15);
      return true;
    }
    return false;
  }

  public strokePet(petId?: string): boolean {
    const pet = petId
      ? petManager.pets.find((p) => p.data.id === petId)
      : petManager.getClosestPet(this.playerPos, 4);

    if (pet) {
      soundManager.playPet();
      pet.data.state = 'BEING_PET';
      pet.data.tameStage = Math.max(pet.data.tameStage, 3);
      pet.data.care.happiness = Math.min(100, pet.data.care.happiness + 25);
      this.spawnHearts(pet.group.position, 8);
      if (this.onPetSelected) this.onPetSelected(pet.data);
      if (this.onLoveGained) this.onLoveGained(20);
      return true;
    }
    return false;
  }

  public hugAdoptPet(petId?: string): boolean {
    const pet = petId
      ? petManager.pets.find((p) => p.data.id === petId)
      : petManager.getClosestPet(this.playerPos, 4);

    if (pet) {
      soundManager.playHugCelebration();
      pet.data.isAdopted = true;
      pet.data.tameStage = 4;
      pet.data.state = 'TAMED_DOMESTIC';
      this.spawnHearts(pet.group.position, 16);

      // Unlock species costume if not unlocked
      const catalog = SPECIES_CATALOG[pet.data.species];
      if (this.onAdoptSuccess) {
        this.onAdoptSuccess(pet.data);
      }
      if (this.onLoveGained) this.onLoveGained(100);
      return true;
    }
    return false;
  }

  /**
   * Daily Magic Wand Cast (Instantly tames pet with sparkling star ray)
   */
  public castMagicWand(): boolean {
    const wildPet = petManager.pets.find(
      (p) => !p.data.isAdopted && p.group.position.distanceTo(this.playerPos) < 18
    );

    if (wildPet) {
      soundManager.playWandCast();
      this.createWandBeam(this.playerPos, wildPet.group.position);
      this.spawnStars(wildPet.group.position, 20);

      wildPet.data.isAdopted = true;
      wildPet.data.tameStage = 4;
      wildPet.data.state = 'TAMED_DOMESTIC';

      if (this.onAdoptSuccess) {
        this.onAdoptSuccess(wildPet.data);
      }
      if (this.onLoveGained) this.onLoveGained(150);
      return true;
    }
    return false;
  }

  /**
   * Throws a bouncy rubber ball for adopted pets to fetch!
   */
  public throwFetchBall(): boolean {
    if (this.fetchBall) {
      this.scene.remove(this.fetchBall.mesh);
      this.fetchBall = null;
    }

    soundManager.playBallThrow();

    const ballMesh = createPropModel('play_ball');
    const startX = this.playerPos.x + Math.sin(this.playerRotY) * 0.9;
    const startZ = this.playerPos.z + Math.cos(this.playerRotY) * 0.9;
    ballMesh.position.set(startX, 1.2, startZ);
    this.scene.add(ballMesh);

    const throwPower = 12.0;
    const vel = new THREE.Vector3(
      Math.sin(this.playerRotY) * throwPower,
      5.8,
      Math.cos(this.playerRotY) * throwPower
    );

    this.fetchBall = {
      mesh: ballMesh,
      pos: new THREE.Vector3(startX, 1.2, startZ),
      vel,
      state: 'THROWN',
      carrierPet: null,
    };

    // Find nearest adopted pet to chase ball
    const domesticPets = petManager.pets.filter((p) => p.data.isAdopted);
    if (domesticPets.length > 0) {
      domesticPets.sort(
        (a, b) =>
          a.group.position.distanceTo(this.playerPos) - b.group.position.distanceTo(this.playerPos)
      );
      const chosenPet = domesticPets[0];
      chosenPet.data.state = 'CHASING_BALL';
      chosenPet.targetPos.copy(this.fetchBall.pos);
      this.spawnHearts(chosenPet.group.position, 4);
    }

    return true;
  }

  /**
   * Captures high-res photo mode screenshot & detects pets in camera view
   */
  public capturePhotoScreenshot(): { dataUrl: string; petsInView: string[] } {
    soundManager.playCameraShutter();

    // Render frame
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    // Detect pets in camera view
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    const petsInView: string[] = [];
    for (const pet of petManager.pets) {
      if (frustum.containsPoint(pet.group.position)) {
        petsInView.push(pet.data.name);
      }
    }

    return { dataUrl, petsInView };
  }

  private createWandBeam(from: THREE.Vector3, to: THREE.Vector3) {
    if (this.wandBeam) {
      this.scene.remove(this.wandBeam);
    }

    const points = [
      new THREE.Vector3(from.x, from.y + 1.2, from.z),
      new THREE.Vector3(
        (from.x + to.x) * 0.5,
        Math.max(from.y, to.y) + 3.0,
        (from.z + to.z) * 0.5
      ),
      new THREE.Vector3(to.x, to.y + 0.6, to.z),
    ];

    const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const mat = new THREE.LineBasicMaterial({ color: '#fff59d', linewidth: 3 });

    this.wandBeam = new THREE.Line(geo, mat);
    this.scene.add(this.wandBeam);
    this.wandBeamTimer = 0.6;
  }

  private spawnHearts(pos: THREE.Vector3, count = 5) {
    const heartGeo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
    const heartMat = new THREE.MeshBasicMaterial({ color: '#ff4081' });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(heartGeo, heartMat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.8,
        pos.y + 0.6 + Math.random() * 0.4,
        pos.z + (Math.random() - 0.5) * 0.8
      );
      mesh.rotation.z = Math.PI * 0.25;
      this.particleGroup.add(mesh);

      this.heartParticles.push({
        mesh,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          1.2 + Math.random() * 1.0,
          (Math.random() - 0.5) * 0.8
        ),
        life: 1.2,
      });
    }
  }

  private spawnStars(pos: THREE.Vector3, count = 12) {
    const starGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const starMat = new THREE.MeshBasicMaterial({ color: '#ffd700' });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(starGeo, starMat);
      mesh.position.set(pos.x, pos.y + 0.8, pos.z);
      this.particleGroup.add(mesh);

      this.heartParticles.push({
        mesh,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          1.5 + Math.random() * 2,
          (Math.random() - 0.5) * 3
        ),
        life: 1.0,
      });
    }
  }

  private spawnRipple(pos: THREE.Vector3) {
    const ringGeo = new THREE.RingGeometry(0.2, 0.4, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#81d4fa',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, 0.05, pos.z);
    this.particleGroup.add(ring);

    this.heartParticles.push({
      mesh: ring,
      vel: new THREE.Vector3(0, 0, 0),
      life: 0.8,
    });
  }

  private bindInputs() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keysHeld[k] = true;

      // Quick Rotate fence / prop with 'R'
      if (k === 'r') {
        buildingSystem.rotatePreview();
      }

      // Quick switch build tool with 'X'
      if (k === 'x') {
        buildingSystem.setTool(buildingSystem.buildTool === 'place' ? 'demolish' : 'place');
      }

      // Throw fetch ball with 'B'
      if (k === 'b') {
        this.throwFetchBall();
      }

      if (e.key === ' ' || k === 'e') {
        // First check if near a signpost to edit it!
        const nearbySign = buildingSystem.getNearbySignpost(this.playerPos, 2.8);
        if (nearbySign && this.onEditSignpost) {
          this.onEditSignpost({
            id: nearbySign.id,
            title: nearbySign.signData?.title || 'Cercado dos Pets',
            icon: nearbySign.signData?.icon || '🐾',
          });
          return;
        }

        // Space or E for contextual interaction
        const closest = petManager.getClosestPet(this.playerPos, 5);
        if (closest) {
          if (!closest.data.isAdopted) {
            if (closest.data.tameStage === 0) this.callPet();
            else if (closest.data.tameStage === 1) this.feedPet(closest.data.id);
            else if (closest.data.tameStage === 2) this.strokePet(closest.data.id);
            else if (closest.data.tameStage === 3) this.hugAdoptPet(closest.data.id);
          } else {
            this.strokePet(closest.data.id);
          }
        } else {
          this.callPet();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.key.toLowerCase()] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
    });

    // Orbit & Zoom events on container
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      // Right-click or middle-click for camera orbit
      if (e.button === 2 || e.button === 1) {
        this.isOrbiting = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        return;
      }

      // Left-click in Build Mode
      if (e.button === 0 && buildingSystem.isBuildMode) {
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.raycaster.ray.intersectPlane(this.groundPlane, this.groundIntersection)) {
          buildingSystem.updatePreviewFromGround(this.groundIntersection);

          if (buildingSystem.buildTool === 'place') {
            buildingSystem.isMouseDrawing = true;
            buildingSystem.placeItemAt(buildingSystem.hoveredGrid.x, buildingSystem.hoveredGrid.z);
            buildingSystem.lastDrawnGrid.x = buildingSystem.hoveredGrid.x;
            buildingSystem.lastDrawnGrid.z = buildingSystem.hoveredGrid.z;
          } else if (buildingSystem.buildTool === 'demolish') {
            buildingSystem.demolishAt(buildingSystem.hoveredGrid.x, buildingSystem.hoveredGrid.z);
          }
        }
        return;
      }

      // Touch drag for camera
      if (e.pointerType === 'touch') {
        this.isOrbiting = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isOrbiting) {
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;

        this.cameraAngle -= dx * 0.008;
        this.cameraPitch = THREE.MathUtils.clamp(
          this.cameraPitch + dy * 0.005,
          0.3,
          1.2
        );
      } else if (buildingSystem.isBuildMode) {
        // Raycast ground plane with mouse
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.raycaster.ray.intersectPlane(this.groundPlane, this.groundIntersection)) {
          buildingSystem.updatePreviewFromGround(this.groundIntersection);
        }
      }
    });

    window.addEventListener('pointerup', () => {
      this.isOrbiting = false;
      buildingSystem.isMouseDrawing = false;
      buildingSystem.lastDrawnGrid.x = 9999;
      buildingSystem.lastDrawnGrid.z = 9999;
    });

    // Prevent context menu on right click to allow smooth camera orbit
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse wheel zoom
    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.cameraDistance = THREE.MathUtils.clamp(
          this.cameraDistance + e.deltaY * 0.015,
          7.0,
          32.0
        );
      },
      { passive: false }
    );

    // Window resize
    window.addEventListener('resize', () => {
      if (!this.container || this.isDestroyed) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  public rotateCameraBy(deltaAngle: number) {
    this.cameraAngle += deltaAngle;
  }

  public zoomCameraBy(deltaZoom: number) {
    this.cameraDistance = THREE.MathUtils.clamp(
      this.cameraDistance + deltaZoom,
      7.0,
      32.0
    );
  }

  private setupWeatherParticles() {
    // 1. Rain Mesh (Instanced drops)
    const rainCount = this.isSoftwareGl ? 120 : 320;
    const rainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4);
    const rainMat = new THREE.MeshBasicMaterial({
      color: '#81d4fa',
      transparent: true,
      opacity: 0.7,
    });
    this.rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, rainCount);
    this.rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 44;
      const y = Math.random() * 16;
      const z = (Math.random() - 0.5) * 44;
      this.rainPositions[i * 3] = x;
      this.rainPositions[i * 3 + 1] = y;
      this.rainPositions[i * 3 + 2] = z;
      _dummyObject.position.set(x, y, z);
      _dummyObject.updateMatrix();
      this.rainMesh.setMatrixAt(i, _dummyObject.matrix);
    }
    this.rainMesh.instanceMatrix.needsUpdate = true;
    this.rainMesh.visible = false;
    this.scene.add(this.rainMesh);

    // 2. Snow Mesh (Instanced flakes)
    const snowCount = this.isSoftwareGl ? 100 : 260;
    const snowGeo = new THREE.SphereGeometry(0.08, 5, 5);
    const snowMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.85,
    });
    this.snowMesh = new THREE.InstancedMesh(snowGeo, snowMat, snowCount);
    this.snowPositions = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      const x = (Math.random() - 0.5) * 44;
      const y = Math.random() * 16;
      const z = (Math.random() - 0.5) * 44;
      this.snowPositions[i * 3] = x;
      this.snowPositions[i * 3 + 1] = y;
      this.snowPositions[i * 3 + 2] = z;
      _dummyObject.position.set(x, y, z);
      _dummyObject.updateMatrix();
      this.snowMesh.setMatrixAt(i, _dummyObject.matrix);
    }
    this.snowMesh.instanceMatrix.needsUpdate = true;
    this.snowMesh.visible = false;
    this.scene.add(this.snowMesh);

    // 3. Sunny Warm Sunbeam Sparkles
    const sunCount = 45;
    const sunGeo = new THREE.SphereGeometry(0.06, 4, 4);
    const sunMat = new THREE.MeshBasicMaterial({
      color: '#fff59d',
      transparent: true,
      opacity: 0.75,
    });
    this.sunSparkleMesh = new THREE.InstancedMesh(sunGeo, sunMat, sunCount);
    this.sunPositions = new Float32Array(sunCount * 3);

    for (let i = 0; i < sunCount; i++) {
      const x = (Math.random() - 0.5) * 36;
      const y = 0.5 + Math.random() * 6;
      const z = (Math.random() - 0.5) * 36;
      this.sunPositions[i * 3] = x;
      this.sunPositions[i * 3 + 1] = y;
      this.sunPositions[i * 3 + 2] = z;
      _dummyObject.position.set(x, y, z);
      _dummyObject.updateMatrix();
      this.sunSparkleMesh.setMatrixAt(i, _dummyObject.matrix);
    }
    this.sunSparkleMesh.instanceMatrix.needsUpdate = true;
    this.sunSparkleMesh.visible = true;
    this.scene.add(this.sunSparkleMesh);
  }

  public cycleWeather(specific?: WeatherType) {
    const sequence: WeatherType[] = ['sunny', 'rainy', 'snowy'];
    if (specific) {
      this.currentWeather = specific;
      this.weatherCycleIndex = sequence.indexOf(specific);
      if (this.weatherCycleIndex < 0) this.weatherCycleIndex = 0;
    } else {
      this.weatherCycleIndex = (this.weatherCycleIndex + 1) % sequence.length;
      this.currentWeather = sequence[this.weatherCycleIndex];
    }

    this.weatherTimer = 45 + Math.random() * 30; // Randomly 45 to 75 seconds per weather
    this.applyWeatherVisuals(this.currentWeather);

    if (this.onWeatherChange) {
      this.onWeatherChange(this.currentWeather);
    }
  }

  public applyWeatherVisuals(weather: WeatherType) {
    if (weather === 'sunny') {
      if (this.dirLight) {
        this.dirLight.color.set('#fff9c4');
        this.dirLight.intensity = 1.8;
      }
      if (this.hemiLight) {
        this.hemiLight.color.set('#ffffff');
        this.hemiLight.groundColor.set('#b9f6ca');
        this.hemiLight.intensity = 0.95;
      }
      this.scene.background = new THREE.Color('#e0f7fa');
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.set('#e0f7fa');
        this.scene.fog.near = 28;
        this.scene.fog.far = 65;
      }
      if (this.groundMat) {
        this.groundMat.color.set('#a7d97b'); // Soft spring meadow
      }
      if (this.rainMesh) this.rainMesh.visible = false;
      if (this.snowMesh) this.snowMesh.visible = false;
      if (this.sunSparkleMesh) this.sunSparkleMesh.visible = true;
      soundManager.setWeatherAmbiance('sunny');
    } else if (weather === 'rainy') {
      if (this.dirLight) {
        this.dirLight.color.set('#b0bec5');
        this.dirLight.intensity = 1.1;
      }
      if (this.hemiLight) {
        this.hemiLight.color.set('#90a4ae');
        this.hemiLight.groundColor.set('#78909c');
        this.hemiLight.intensity = 0.75;
      }
      this.scene.background = new THREE.Color('#cfd8dc');
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.set('#cfd8dc');
        this.scene.fog.near = 16;
        this.scene.fog.far = 42;
      }
      if (this.groundMat) {
        this.groundMat.color.set('#7cb342'); // Fresh rain-soaked green
      }
      if (this.rainMesh) this.rainMesh.visible = true;
      if (this.snowMesh) this.snowMesh.visible = false;
      if (this.sunSparkleMesh) this.sunSparkleMesh.visible = false;
      soundManager.setWeatherAmbiance('rainy');
    } else if (weather === 'snowy') {
      if (this.dirLight) {
        this.dirLight.color.set('#e1f5fe');
        this.dirLight.intensity = 1.35;
      }
      if (this.hemiLight) {
        this.hemiLight.color.set('#bbdefb');
        this.hemiLight.groundColor.set('#e0e0e0');
        this.hemiLight.intensity = 0.85;
      }
      this.scene.background = new THREE.Color('#e3f2fd');
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.set('#e3f2fd');
        this.scene.fog.near = 20;
        this.scene.fog.far = 48;
      }
      if (this.groundMat) {
        this.groundMat.color.set('#e8f5e9'); // Snow-kissed frosted green
      }
      if (this.rainMesh) this.rainMesh.visible = false;
      if (this.snowMesh) this.snowMesh.visible = true;
      if (this.sunSparkleMesh) this.sunSparkleMesh.visible = false;
      soundManager.setWeatherAmbiance('snowy');
    }
  }

  private updateWeatherParticles(dt: number) {
    this.weatherParticleTime += dt;

    // 1. Update Rain
    if (this.currentWeather === 'rainy' && this.rainMesh && this.rainPositions) {
      const count = this.rainMesh.count;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        this.rainPositions[idx + 1] -= dt * 26; // Rapid fall

        // Reset if hitting ground
        if (this.rainPositions[idx + 1] < 0) {
          this.rainPositions[idx] = this.playerPos.x + (Math.random() - 0.5) * 44;
          this.rainPositions[idx + 1] = 14 + Math.random() * 4;
          this.rainPositions[idx + 2] = this.playerPos.z + (Math.random() - 0.5) * 44;
        }

        _dummyObject.position.set(
          this.rainPositions[idx],
          this.rainPositions[idx + 1],
          this.rainPositions[idx + 2]
        );
        _dummyObject.updateMatrix();
        this.rainMesh.setMatrixAt(i, _dummyObject.matrix);
      }
      this.rainMesh.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Snow
    if (this.currentWeather === 'snowy' && this.snowMesh && this.snowPositions) {
      const count = this.snowMesh.count;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        this.snowPositions[idx + 1] -= dt * 2.8; // Gentle snowfall
        // Gentle horizontal drift
        const sway = Math.sin(this.weatherParticleTime * 1.5 + i * 0.7) * dt * 0.8;
        this.snowPositions[idx] += sway;

        // Reset when reaching ground
        if (this.snowPositions[idx + 1] < 0.1) {
          this.snowPositions[idx] = this.playerPos.x + (Math.random() - 0.5) * 44;
          this.snowPositions[idx + 1] = 13 + Math.random() * 4;
          this.snowPositions[idx + 2] = this.playerPos.z + (Math.random() - 0.5) * 44;
        }

        _dummyObject.position.set(
          this.snowPositions[idx],
          this.snowPositions[idx + 1],
          this.snowPositions[idx + 2]
        );
        _dummyObject.updateMatrix();
        this.snowMesh.setMatrixAt(i, _dummyObject.matrix);
      }
      this.snowMesh.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Sunny Sparkles
    if (this.currentWeather === 'sunny' && this.sunSparkleMesh && this.sunPositions) {
      const count = this.sunSparkleMesh.count;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        this.sunPositions[idx + 1] += dt * 0.35; // Gentle float up
        this.sunPositions[idx] += Math.sin(this.weatherParticleTime + i) * dt * 0.2;

        if (this.sunPositions[idx + 1] > 7.5) {
          this.sunPositions[idx] = this.playerPos.x + (Math.random() - 0.5) * 36;
          this.sunPositions[idx + 1] = 0.4 + Math.random() * 0.8;
          this.sunPositions[idx + 2] = this.playerPos.z + (Math.random() - 0.5) * 36;
        }

        _dummyObject.position.set(
          this.sunPositions[idx],
          this.sunPositions[idx + 1],
          this.sunPositions[idx + 2]
        );
        _dummyObject.updateMatrix();
        this.sunSparkleMesh.setMatrixAt(i, _dummyObject.matrix);
      }
      this.sunSparkleMesh.instanceMatrix.needsUpdate = true;
    }
  }

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const dt = this.clock.getDelta();
      const clampedDt = Math.min(dt, 0.05);

      this.update(clampedDt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(dt: number) {
    // 1. Day / Night Peaceful Ambient Shift
    this.timeOfDay = (this.timeOfDay + dt * this.daySpeed) % 24;
    if (this.dirLight && this.hemiLight) {
      // Gentle sun arc
      const sunAngle = ((this.timeOfDay - 6) / 12) * Math.PI;
      this.dirLight.position.set(
        Math.cos(sunAngle) * 35,
        Math.max(12, Math.sin(sunAngle) * 35),
        25
      );
      // Sky tint with weather adaptation
      if (this.timeOfDay > 6 && this.timeOfDay < 18) {
        if (this.currentWeather === 'sunny') {
          this.scene.background = new THREE.Color('#e0f7fa');
          this.scene.fog!.color.set('#e0f7fa');
          this.hemiLight.intensity = 0.95;
        } else if (this.currentWeather === 'rainy') {
          this.scene.background = new THREE.Color('#cfd8dc');
          this.scene.fog!.color.set('#cfd8dc');
          this.hemiLight.intensity = 0.75;
        } else {
          this.scene.background = new THREE.Color('#e3f2fd');
          this.scene.fog!.color.set('#e3f2fd');
          this.hemiLight.intensity = 0.85;
        }
      } else {
        // Soft cozy twilight / starlight
        this.scene.background = new THREE.Color('#283593');
        this.scene.fog!.color.set('#283593');
        this.hemiLight.intensity = 0.5;
      }
    }

    // Weather Cycle Timer & Particles
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.cycleWeather();
    }
    this.updateWeatherParticles(dt);

    // 2. Player Input & Movement
    let moveX = 0;
    let moveZ = 0;

    if (this.keysHeld['w'] || this.keysHeld['arrowup']) moveZ -= 1;
    if (this.keysHeld['s'] || this.keysHeld['arrowdown']) moveZ += 1;
    if (this.keysHeld['a'] || this.keysHeld['arrowleft']) moveX -= 1;
    if (this.keysHeld['d'] || this.keysHeld['arrowright']) moveX += 1;

    // Add Joystick input
    if (this.joystickVec.x !== 0 || this.joystickVec.y !== 0) {
      moveX += this.joystickVec.x;
      moveZ += this.joystickVec.y;
    }

    const inputLen = Math.hypot(moveX, moveZ);
    this.isPlayerRunning = this.keysHeld['shift'] || inputLen > 0.85;

    if (inputLen > 0.05) {
      // Normalize
      const normX = moveX / Math.max(1, inputLen);
      const normZ = moveZ / Math.max(1, inputLen);

      // Camera relative movement
      const forward = _v1.set(-Math.sin(this.cameraAngle), 0, -Math.cos(this.cameraAngle)).normalize();
      const right = _v2.set(Math.cos(this.cameraAngle), 0, -Math.sin(this.cameraAngle)).normalize();

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, normX)
        .addScaledVector(forward, -normZ)
        .normalize();

      const speed = this.isPlayerRunning ? 6.5 : 4.0;
      this.playerPos.addScaledVector(moveDir, speed * dt);

      // Solid 2.5D sliding collision pushback against fences, trees, and cottage
      collisionSystem.resolveCollision(this.playerPos, 0.45);

      // Constrain player within sanctuary borders
      this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -48, 48);
      this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -48, 48);

      // Smooth rotate towards moving direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.playerRotY = THREE.MathUtils.damp(this.playerRotY, targetAngle, 12, dt);

      // Animate walking limbs
      this.playerWalkCycle += dt * (this.isPlayerRunning ? 16 : 10);
      const legSwing = Math.sin(this.playerWalkCycle) * 0.6;
      if (this.playerAnimRefs) {
        this.playerAnimRefs.leftLeg.rotation.x = legSwing;
        this.playerAnimRefs.rightLeg.rotation.x = -legSwing;
        this.playerAnimRefs.leftArm.rotation.x = -legSwing * 0.7;
        this.playerAnimRefs.rightArm.rotation.x = legSwing * 0.7;
      }

      // Procedural footstep sound
      if (Math.sin(this.playerWalkCycle) > 0.95) {
        soundManager.playFootstep();
      }
    } else {
      // Idle pose
      if (this.playerAnimRefs) {
        this.playerAnimRefs.leftLeg.rotation.x = 0;
        this.playerAnimRefs.rightLeg.rotation.x = 0;
        this.playerAnimRefs.leftArm.rotation.x = 0;
        this.playerAnimRefs.rightArm.rotation.x = 0;
      }
    }

    if (this.playerGroup) {
      this.playerGroup.position.copy(this.playerPos);
      this.playerGroup.rotation.y = this.playerRotY;
    }

    // 3. Fallback Update Building System Ghost Preview if mouse raycast hasn't initialized
    if (!buildingSystem.isMouseDrawing && buildingSystem.hoveredGrid.x === 0 && buildingSystem.hoveredGrid.z === 0) {
      buildingSystem.updatePreviewFromPlayer(this.playerPos, this.playerRotY);
    }

    // 4. Update Pets with Weather Impacts
    petManager.update(dt, this.playerPos, this.isPlayerRunning, this.currentWeather);

    // Check closest pet for HUD highlight
    const closest = petManager.getClosestPet(this.playerPos, 5);
    if (this.onPetSelected) {
      this.onPetSelected(closest ? closest.data : null);
    }

    // 5. Update Fetch Ball Physics & Pet Retrieval
    if (this.fetchBall) {
      const fb = this.fetchBall;
      if (fb.state === 'THROWN' || fb.state === 'BOUNCING') {
        fb.vel.y -= 22 * dt;
        fb.pos.addScaledVector(fb.vel, dt);

        if (fb.pos.y <= 0.25) {
          fb.pos.y = 0.25;
          fb.vel.y = -fb.vel.y * 0.62;
          fb.vel.x *= 0.72;
          fb.vel.z *= 0.72;

          if (Math.abs(fb.vel.y) > 1.2) {
            soundManager.playBallBounce();
          } else {
            fb.state = 'IDLE';
            fb.vel.set(0, 0, 0);
          }
        }
        fb.mesh.position.copy(fb.pos);
        fb.mesh.rotation.x += dt * 8;
        fb.mesh.rotation.z += dt * 6;
      }

      // Check if chasing pet reached the ball
      const chasingPet = petManager.pets.find((p) => p.data.state === 'CHASING_BALL');
      if (chasingPet) {
        chasingPet.targetPos.copy(fb.pos);
        if (chasingPet.group.position.distanceTo(fb.pos) < 0.9) {
          // Pet grabs ball in its mouth!
          fb.state = 'CARRIED';
          fb.carrierPet = chasingPet;
          chasingPet.data.state = 'RETURNING_BALL';
          soundManager.playPetShake();
          this.spawnHearts(chasingPet.group.position, 5);
        }
      }

      // If carried by pet, keep ball in pet mouth and check return to player
      if (fb.state === 'CARRIED' && fb.carrierPet) {
        const petMesh = fb.carrierPet.group;
        const forwardX = Math.sin(petMesh.rotation.y) * 0.45;
        const forwardZ = Math.cos(petMesh.rotation.y) * 0.45;
        fb.mesh.position.set(petMesh.position.x + forwardX, 0.42, petMesh.position.z + forwardZ);

        if (petMesh.position.distanceTo(this.playerPos) < 1.9) {
          // Pet successfully delivered ball to player!
          soundManager.playHugCelebration();
          this.spawnHearts(petMesh.position, 14);
          this.spawnStars(this.playerPos, 8);

          fb.carrierPet.data.state = 'BEING_PET';
          fb.carrierPet.data.care.happiness = 100;

          if (this.onLoveGained) this.onLoveGained(35);
          if (this.onFetchSuccess) this.onFetchSuccess();

          this.scene.remove(fb.mesh);
          this.fetchBall = null;
        }
      }
    }

    // 6. Update Wand Beam
    if (this.wandBeam && this.wandBeamTimer > 0) {
      this.wandBeamTimer -= dt;
      if (this.wandBeamTimer <= 0) {
        this.scene.remove(this.wandBeam);
        this.wandBeam = null;
      }
    }

    // 6. Update Particle Pool
    for (let i = this.heartParticles.length - 1; i >= 0; i--) {
      const p = this.heartParticles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.mesh.scale.x > 0.05) {
        p.mesh.scale.multiplyScalar(0.98);
      }
      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.heartParticles.splice(i, 1);
      }
    }

    // 7. Camera Smooth Follow (Isometric 360)
    this.cameraTarget.x = THREE.MathUtils.damp(this.cameraTarget.x, this.playerPos.x, 8, dt);
    this.cameraTarget.y = THREE.MathUtils.damp(this.cameraTarget.y, this.playerPos.y + 1.2, 8, dt);
    this.cameraTarget.z = THREE.MathUtils.damp(this.cameraTarget.z, this.playerPos.z, 8, dt);

    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    _camOffset.set(
      Math.sin(this.cameraAngle) * horizontalDist,
      verticalDist,
      Math.cos(this.cameraAngle) * horizontalDist
    );

    this.camera.position.copy(this.cameraTarget).add(_camOffset);
    this.camera.lookAt(this.cameraTarget);
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.renderer.dispose();
  }
}
