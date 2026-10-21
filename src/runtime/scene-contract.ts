export type MallId = 'saigon-centre' | 'vincom-dong-khoi';
export type Locale = 'vi' | 'en';
export type SceneKind = 'exterior' | 'overview' | 'map' | 'discovery';
export type ExteriorArrivalStage = 'establish' | 'facade' | 'settle' | 'complete';
export type SceneRequest = { kind: SceneKind; floorId: string };
export type PreparationPhase = 'fetching' | 'decoding' | 'preparing' | 'ready' | 'failed';
export type PreparedSceneStatus = { key: string; phase: PreparationPhase; error?: string };
export type FloorRegion = { id: string; outer: [number, number][]; holes: [number, number][][]; role: string; certainty: string };
export type FloorGeometry = {
  id: string; label: string; order: number; elevation: number;
  bounds: [number, number, number, number]; regions: FloorRegion[];
  sources: { path: string; sha256: string; width: number; height: number; transform: number[]; certainty: string }[];
  preview: { path: string; width: number; height: number } | null;
  presentation?: { outline:[number,number][]; referenceZonePaths:string[] };
};
export type FloorDataset = {
  revision: string;
  frame: { version: string; units: string; scaleStatus: string; orientationStatus: string };
  floors: FloorGeometry[];
};
export type SceneRuntime = {
  prepare(request: SceneRequest): Promise<void>;
  isPrepared(request: SceneRequest): boolean;
  show(request: SceneRequest): Promise<void>;
  setActive(active: boolean): void;
  setPaused(paused: boolean): void;
  setJourneyProgress(progress: number, reducedMotion: boolean): void;
  /** Deltas: rotate/look in radians, zoom in relative fit-distance units. */
  adjustExterior(change: { rotate?: number; look?: number; zoom?: number }): void;
  resetExterior(): void;
  stopAutomaticPresentation(): void;
  replayArrival(): void;
  dispose(): void;
};
export type SceneRuntimeOptions = {
  canvas: HTMLCanvasElement; mallId: MallId; data: FloorDataset;
  assetRevision: string; exteriorUrl: string; modelBytes?: Promise<ArrayBuffer>;
  exteriorIdentityUrl?: string;
  reducedMotion: boolean; onStatus(status: PreparedSceneStatus): void;
  sceneHosts?: Record<SceneKind, HTMLElement>;
};
