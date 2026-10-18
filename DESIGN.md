---
name: Mall visitor journey
description: Porcelain and lacquer journey, tickets 01–03; content approval remains separate
colors:
  paper: "#fff9f1"
  vincom-paper: "#fffbf3"
  ink: "#231c17"
  muted: "#64584e"
  divider: "#e0d3c4"
  map-edge: "#7e6c59"
  control-edge: "#88796c"
  map-background: "#f0e7da"
  floor-top: "#efe6dc"
  vincom-floor-top: "#efe8dc"
  overview-paper: "#f4eade"
  overview-edge: "#cdbda9"
  overview-map: "#ede2d3"
  reading-paper: "#fffdfa"
  fixture-background: "#f7e2b4"
  fixture-ink: "#352614"
  shadow: "#46322224"
  saigon-action: "#a12b18"
  saigon-selected: "#ffe6dc"
  vincom-action: "#744600"
  vincom-selected: "#f5e4bf"
  saigon-lacquer: "#c63219"
  vincom-gold: "#8a5400"
typography:
  display:
    fontFamily: "Manrope, Guide, sans-serif"
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Guide, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
---

# Design System: Mall visitor journey

## Overview

The owner-approved Porcelain / lacquer world presents the isolated mall exterior on warm paper. The introduction uses the approved Daylight gallery composition. This record covers the integrated introduction, source-floor overview, practical map/directory and Discovery surfaces. Real directory data and release acceptance remain pending.

## Colors

Warm paper and dark ink support reading. Saigon uses red lacquer; Vincom uses brown gold. Accent identifies the mall name, current language, and scroll cue. Secondary text uses warm brown. The scene background matches its mall's paper.

## Typography

Practical section headings use 28–42px, overview headings 32–52px, and directory subheadings 22px. Controls and floor labels use at least 16px. Supporting schematic disclosure uses 13px on narrow screens.

Self-hosted Manrope gives headings their architectural scale. Guide is the self-hosted Be Vietnam Pro face used for copy and controls. Display size adapts from 40 to 76 CSS pixels on desktop; phone headings adapt from 40 to 60 pixels. Introduction copy has a 37-character measure and generous leading.

## Layout

The map occupies the larger sticky right column (about two thirds) as the solid directory and Discovery reading sections scroll on the left, matching the approved prototype. Below 700px it becomes a compact sticky map above a single reading column. Scroll scales and tilts the preview without fading its independent glass controls; reduced motion removes the transform. At heights of 600px or less the map scrolls normally so enlarged/reflowed reading content stays reachable. The SVG carries area interactions in its source coordinate frame; unregistered 3D geometry does not establish destination positions.

The desktop introduction pairs copy and building in a 38:62 grid. At 700 pixels and below, copy precedes the scene vertically. The bottom scroll instruction follows the building. Phone composition can exceed one viewport to retain readable copy and model space. Practical sections and focus targets account for the fixed navigation.

## Elevation & Depth

Compact map controls and the post-hero header use 62% white glass, 24px blur and 1.3 saturation, with dark ink and a fine white rim. The toolbar overlaps actual source-map polygons. These values remain an owner-reviewable trial, not a newly approved material specification. Unsupported blur and reduced transparency use solid porcelain. Reading panels stay opaque. Glass values are an implemented trial; rendered approval is separate.

The post-hero header is compact and elevated with an offset diffuse shadow. Supported browsers blur its backdrop; reduced transparency and unsupported blur use opaque paper. Reading areas remain solid.

The overview presents the existing source polygons as separated CSS-perspective SVG layers using the union of the recorded schematic bounds, with a vertical floor rail on the right. No source polygon, physical elevation, inferred slab or scene-runtime camera is changed. The complete scene preparation contract remains intact; the source-layer presentation also works without JavaScript or after scene failure. Registration remains unverified.

## Shapes

The building has an open, unframed scene. Language and Pause controls have minimal chrome. The floating header has gently curved corners; the bottom instruction uses a fine divider and authored arrow.

Map tools use one authored 24px line-icon family, 44px targets, localized accessible names and title hints. Selected state retains an opaque pale inset and dark edge; keyboard focus adds a separate dark ring with a white separator.

## Components

The full header appears only after the hero ends and is inert while hidden. Floor map precedes Discovery. VI/EN and Pause remain available within the introduction. Pause persists through navigation, reload and Retry. Reduced motion stops both rotation and the scroll cue and disables Resume while the preference is active. Native scrolling and page zoom remain available.

## Do's and Don'ts

Keep the approved building assets and concise bilingual introduction. Keep the keyboard skip link and bottom scroll instruction. Do not restore the removed hero-copy CTA buttons or add manual hero orbit/zoom. Do not treat schematic floor geometry or unreviewed directory content as verified visitor data.

## Owner layout amendment — 18 October 2026

The centered overview caption and floor stack now share the page axis, while the introduction keeps its existing copy/building arrangement. Its scroll cue is confined to the introduction and becomes hidden/inert after departure. Matching floor labels, connectors and slabs fade and neutralize together on hover/focus.

The detailed map is a quiet full-width composition with the descending vertical floor rail and compact map tools. The area-link grid, map search/full directory, banner, facilities and reference-image blocks are removed from this interactive section; requested destination details and shared-area selection remain available. Static fallback listings remain independent. A spacious, centered bilingual invitation follows the map and leads to Discovery. Discovery restores browsing beside the same retained map; phone reading stays below the sticky map. This supersedes the earlier left-directory/right-map and four-section layout paragraphs for this revision, without changing the Porcelain palette, fonts, glass controls or content/geometry approval boundaries.
