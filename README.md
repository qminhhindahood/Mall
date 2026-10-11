# Mall visitor websites

Two bilingual visitor websites sharing the Porcelain visual style and floating glass controls:

- `vincom-dong-khoi`: Vincom Center Đồng Khởi.
- `takashimaya`: the entire Saigon Centre shopping mall, including Takashimaya and surrounding tenants.

Each site keeps its own content, assets, and deployment. Shared style and interaction changes should reach both branches.

The consolidated specification is [issue #1](https://github.com/qminhhindahood/Mall/issues/1).

## Selected technology stack

- TypeScript is the programming language.
- Astro statically generates bilingual introduction, floor, and destination pages.
- React coordinates the visitor journey, selection, search, Discovery, and navigation/history.
- Three.js through React Three Fiber loads separately for browser 3D.
- CSS implements the shared Porcelain style and bold floating glass.
- Blender authors building models exported as GLB assets.
- Two independent Cloudflare Workers Static Assets deployments serve the mall-specific builds.

The ordinary directory and SVG floor map must stay usable when 3D fails. Browser-level journey checks remain the automated test boundary. The selected stack still needs a browser feasibility demonstration; it does not resolve Saigon Centre's missing exterior references or establish production-ready models.

This initial baseline establishes the site branches. Application code, prototypes, and reference assets have not yet been added.
