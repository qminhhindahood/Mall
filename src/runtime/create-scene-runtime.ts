import type { SceneRuntime, SceneRuntimeOptions } from './scene-contract';
// Replaced by issue 0013. The static foundation never treats a placeholder as ready.
export async function createSceneRuntime(_options: SceneRuntimeOptions): Promise<SceneRuntime> {
  throw new Error('Complete-frame scene runtime is not available in this foundation revision.');
}
