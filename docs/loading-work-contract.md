# Shared implementation seams — full-detail loading

Canonical workspace specification: `D:/Midterm/docs/superpowers/specs/2026-10-13-full-detail-loading-implementation-spec.md`. Tracker: `D:/Midterm/docs/issues/0010-full-detail-loading-implementation.md` and 0011–0014. Root `D:/Midterm/AGENTS.md` applies. Fixed review base: `2c35231`; integration branch `integration/full-detail-3d-loading`. No PR/push/deployment. Confirmed test seam: public browser journeys only; apply TDD there, no reducer/helper unit suites. Current exterior worktrees are read-only inputs; do not commit/change them.

## Data seam (0012 owns)

`data/malls/saigon-centre/floor-geometry.json` and `data/malls/vincom-dong-khoi/floor-geometry.json`:

```
{ revision: string,
  frame: { version: string, units: string, scaleStatus: string, orientationStatus: string },
  floors: [{ id: string, label: string, order: number, elevation: number,
    bounds: [minX,minY,maxX,maxY],
    regions: [{ id: string, outer: [number,number][], holes: [number,number][][],
                role: string, certainty: string }],
    sources: [{ path: string, sha256: string, width: number, height: number,
                transform: number[], certainty: string }],
    preview: { path: string, width: number, height: number } }] }
```

Outer rings/holes use the same local planar x/z values for SVG and live Three.js extrusion. Heights are schematic, L1 zero, basements below, M between L1/L2. Do not infer holes or separately normalize each floor's extents. Data revision/estimates must be explicit. Floor preview paths are root-relative `/maps/{floorId}.{ext}` within each selected build. Unchanged reference images may retain source bytes; do not use them as new current tenant approvals.

Exact exterior delivery inputs: `assets/{mallId}/models/exterior.glb` (current polished web bytes), `assets/{mallId}/previews/exterior.webp`, mall-specific maps and shared `assets/shared/fonts/`. Output preparation copies only the selected mall into `public/models`, `public/previews`, `public/maps`. `data/malls/{mallId}/asset-manifest.json` records exterior source revision, sha256, bytes, compression variants and source references. 0012 owns `scripts/prepare-assets.mjs`, `scripts/serve-static.mjs` and compression/identity evidence; coordinate invocation names with package scripts. Server must negotiate br/gzip as Content-Encoding on the original resource URL, Vary appropriately and serve truthful route/404 behavior. No browser loads .br bytes without decoding.

## App seam (0011 owns)

Build variable `MALL_ID=saigon-centre|vincom-dong-khoi`, default Saigon. `npm run build:saigon` / `build:vincom` produce separate `dist/saigon-centre` and `dist/vincom-dong-khoi`, with only the selected mall public assets. Useful static routes `/vi`, `/en`, localized floors; source data imported from the data seam. A tiny explicit seed may be used before 0012 merge, but empty/unavailable geometry is disclosed and then replaced by actual source-derived records. No synthetic tenants in default output. Reviewed destination seam supports records and generated localized routes; test fixtures are isolated and excluded by default.

Scene interface exported from `src/runtime/scene-contract.ts` (0011 creates types; 0013 implements renderer):

```
type SceneKind = 'exterior' | 'overview' | 'map' | 'discovery';
type SceneRequest = { kind: SceneKind; floorId: string };
type PreparationPhase = 'fetching' | 'decoding' | 'preparing' | 'ready' | 'failed';
type PreparedSceneStatus = { key: string; phase: PreparationPhase; error?: string };
type SceneRuntime = {
  prepare(request: SceneRequest): Promise<void>;
  show(request: SceneRequest): Promise<void>;
  setActive(active: boolean): void;
  setPaused(paused: boolean): void;
  dispose(): void;
};
```

Factory is dynamically imported from `src/runtime/create-scene-runtime.ts`; only called in browser. Context/config supplies host canvas, selected mall data/model source, reduced-motion state and status callback. Define concrete factory options in scene-contract without coupling the SSR shell to Three.js. The React owner preserves requested view/floor/locale; runtime status cannot mutate selection. The loader awaits exterior/overview and the current route's requested scene before entry; later pending requests show full-page loading. Static guide/error fallback stays outside the renderer boundary. Initial resource fetch may begin before the factory import completes; 0013 may refine the factory contract as needed with one synchronized shell change.

## Worktree ownership

0011 owns package/framework/config/src shell and browser shell checks. 0012 owns data/assets/asset scripts and source/compression evidence. These can merge independently. 0013 starts only after both are merged and owns real runtime/shell integration and its browser checks. 0014 follows runtime and owns timing/network/browser evidence and remaining fixes. Every implementer reads the tdd skill and uses the already-authorized browser seam. Keep shared preview visible; if a test tab is needed use preview_status then preview_open(open:false,reuseExistingTab:false), do not navigate/hide root tab_g.
