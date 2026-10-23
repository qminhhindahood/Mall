---
name: Mall visitor journey
description: Architectural welcome and standalone Discovery; Home/Discovery r13 candidate
colors:
  saigon-paper: "#f5f3eb"
  saigon-ink: "#243a30"
  saigon-muted: "#58675e"
  saigon-action: "#315d47"
  saigon-divider: "#d6ddd2"
  saigon-selected: "#e0e9dc"
  saigon-surface: "#fffefa"
  vincom-paper: "#f4f5f7"
  vincom-ink: "#243549"
  vincom-muted: "#596879"
  vincom-action: "#365d83"
  vincom-divider: "#d5dee7"
  vincom-selected: "#e1e9f2"
  vincom-surface: "#fff"
typography:
  display:
    fontFamily: "Manrope, Guide, sans-serif"
    fontSize: "clamp(48px, 5.3vw, 76px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, Guide, sans-serif"
    fontSize: "clamp(44px, 5vw, 68px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Guide, sans-serif"
    fontSize: "16px"
    lineHeight: 1.75
rounded:
  action: "4px"
spacing:
  phone-gutter: "24px"
  reading-gutter: "48px"
  section: "112px"
  section-phone: "56px"
---

# Design System: Mall visitor journey

## Overview

**Creative North Star: "Architectural welcome."** The r13 Home/Discovery replacement places the actual exterior on soft daylight paper, followed by concise introductions to the two visitor tasks. Standalone Discovery uses readable editorial selections and a complete practical directory. Quiet typography, wide gutters and restrained green or blue accents replace the prior Porcelain / lacquer Home composition.

This records the implemented isolated candidate, not official mall branding or new release acceptance. It supersedes the earlier post-hero glass header, continuous floor-stack journey and map-beside-Discovery guidance. Directions retains its existing combined glass origin/destination card, map and steps. Original approved assets and source qualifications remain intact; asset revision is still `photo-polish-2026-10-12-delivery-r2`.

## Colors

**The Mall Identity Rule.** Use warm mineral paper and forest green for Saigon, cool paper and architectural blue for Vincom. Each mall's ink, muted copy, fine divider and selected surface belong to the same palette. Action accents identify active navigation and practical actions; pale selected surfaces give highlights and the source-plan preview their grouping. Inputs use the brighter surface token. The normative values above come from `src/styles/home-discovery.css`.

## Typography

Self-hosted Manrope supplies calm architectural headings; Guide is the self-hosted Be Vietnam Pro face for text and controls. Home display and Discovery headline roles use medium weight and tight tracking. At widths up to 700px both page titles use 44px; Home leading becomes 1.1. Home copy has a 34ch desktop measure and 38ch phone measure, with 14px phone text. Supporting labels are quieter (11-14px), so the old blanket 16px control-label rule no longer describes this implementation.

Home section headings scale from 34px to 48px. Discovery selections use 26px medium headings (23px at the intermediate breakpoint); destination rows use 20px, weight 550, with 13px type and 12px metadata. Detail titles are 32px medium weight. **The Reading Hierarchy Rule.** Keep destination identity, location precision and actions prominent; unresolved research belongs in the disclosure below verified detail fields.

## Layout

Home uses a 40:60 copy/exterior grid, a 1600px maximum width and responsive 24-80px gutters. Its unframed scene is in normal layout rather than a long sticky floor-transition track. The desktop introduction is one viewport high within 800-1100px bounds; a compact control shelf sits beneath the exterior. On phones, copy precedes a 350px scene region containing a 270px exterior viewport. The desktop scroll instruction is hidden on phones.

Below Home, two alternating preview sections introduce Discovery with real directory names and Directions with an actual supplied source-plan preview. The reading container is 1320px wide with 48px desktop and 24px phone gutters. Sections use 112px vertical padding, reduced to 56px on phones.

Discovery is a separate full-page reading surface. It starts with its title and three editorial selections, then labelled search, scope, category browsing, floor choices and complete results. Desktop search pairs the field with a 240px scope column; browsing pairs a sticky 220px category rail with two-column destination rows. At 1050px the rail narrows to 180px and gaps reduce. At 700px the selections and results become single-column, search stacks, and categories become a horizontal scrolling rail. There is no persistent map beside this Discovery page.

The shared solid header is present immediately, with an 88px desktop minimum height and a 108px phone minimum. Main content clears it; Discovery begins with 148px top padding. Directions keeps the existing desktop combined sidebar and phone card, map, then steps ordering.

## Elevation & Depth

**The Quiet Surface Rule.** Home and Discovery rely on paper, pale tonal grouping and fine dividers. The header and exterior control shelf have no shadow or backdrop blur. The building is open and unframed; highlight cards are solid.

The retained Directions combined glass card remains a functional exception over the actual map. Its existing material, map controls, opaque/reduced-transparency fallbacks and source-coordinate interactions are not redesigned by this document. Unregistered 3D geometry never establishes a destination position. Do not propagate the retained Directions glass treatment to the new Home header or full reading surfaces.

## Shapes

Actions, search inputs, highlight cards, filter links and detail location summaries use restrained 4px corners. The full-width header and control shelf have square edges, separated by fine rules. The small brand symbol stays circular. Use existing line icons and visible keyboard focus; preserve the 44px action-target baseline even when labels are smaller. Search fields and scope selects are at least 52px high.

## Components

**Navigation.** The solid full-width shell exposes Home, Discovery and Directions alongside VI/EN. Current-page navigation uses a 2px accent underline without a filled pill. Native links, focus and history remain part of the interaction.

**Exterior arrival.** The first Home visit in a session opens with two brighter accent door panels (about 1.2s, CSS only, never blocking clicks), then the heading rises line by line from a mask, followed by the one-sentence introduction, actions and a small uppercase meta row (listing count, floor count and range, derived from the dataset; no address). The building then holds the settled front three-quarter framing with a slow, bounded idle sway (about ±10° over 26s, never revealing the rear or roof); there is no establish/facade camera tour or close-up dive. Pointer, key, wheel or touch intent settles the entrance and pauses the sway for 4s; it stops offscreen, in hidden tabs and under reduced motion, which shows the settled page with no doors. `homeMotion.arrival = 'cinematic'` is the quieter alternative: no panels and one camera push of at most 1.1x before the same sway. The earlier facade title lift no longer triggers because the sway has no facade stage.

**Home previews.** Directory picks are typographic rows with a fine divider and arrow; the Directions preview shows supplied plan geometry on a pale selected surface. Both lead to full-page tasks instead of duplicating their complete tools on Home.

**Discovery highlights and results.** Highlights use real directory names and category/location context, not fabricated store photography. Their pale panels have 28px desktop padding and a 220px minimum height; phones use 24px and 184px. Hover subtly deepens the selected surface. Complete destination rows are open, divided reading items whose names underline on hover. Search and category/floor controls remain separate from editorial selections.

**Store detail.** Location precision and partial/shared-area qualifications remain immediate. Primary actions and location summaries share the small corner treatment. Verified fields precede a research disclosure with a 44px summary target. Existing deep links, locale and selection handoffs remain supported.

## Do's and Don'ts

- Do retain original building models, supplied plans, accepted directory records and reviewed route connections. Preserve partial/shared-area, Opening Soon and unresolved-metadata qualifications.
- Do keep practical navigation usable before the model and after model failure; retain reduced-motion and keyboard paths.
- Do preserve the existing Directions combined glass card and source map behavior.
- Don't restore the previous long floor-transition tracks or map-beside-Discovery layout in this replacement.
- Don't remove direct exterior controls or immediate Discovery/Directions actions based on the superseded document.
- Don't infer exact doors, universal routing, physical verification or publication approval from this visual redesign.
