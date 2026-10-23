/** Placement of shop names on a floor plan, shared by every map that shows names.
 * Names are never truncated: they wrap onto up to three lines and are sized to their unit
 * between a readable minimum and maximum. When a name cannot fit at the minimum it may
 * overhang its unit slightly; collisions are resolved by priority (selected, then fitting,
 * then larger units), and a label that would still overlap another is left out.
 */
export type LabelInput = { id: string; name: string; x: number; y: number; width: number; height: number; area: number; active: boolean };
export type PlacedLabel = { id: string; x: number; y: number; size: number; lines: string[]; active: boolean };

// Approximate advance widths for Be Vietnam Pro / Guide at weight 600, in ems.
const advance = (char: string) => char === ' ' ? .28 : /[A-ZĐ0-9&]/.test(char) ? .66 : /[mwMW]/.test(char) ? .82 : /[il.,'’!|]/.test(char) ? .3 : .55;
const textWidth = (text: string, size: number) => [...text].reduce((sum, char) => sum + advance(char), 0) * size;

function wrap(name: string, size: number, maxWidth: number) {
  const words = name.split(/\s+/).filter(Boolean), lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last !== undefined && textWidth(`${last} ${word}`, size) <= maxWidth) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function placeLabels(inputs: LabelInput[], frameMax: number): PlacedLabel[] {
  // Sizes are fractions of the plan frame. Maps render at roughly 500–1000px wide, so the minimum
  // stays near 10px or more; small units without room give way rather than shrink further.
  const minSize = frameMax * .02, maxSize = frameMax * .03, lineHeight = 1.12, maxLines = 3;
  const candidates = inputs.map(input => {
    const room = input.width * .9, tall = input.height * .86;
    for (let size = maxSize; size >= minSize - 1e-9; size *= .94) {
      const lines = wrap(input.name, size, room);
      const width = Math.max(...lines.map(line => textWidth(line, size)));
      if (lines.length <= maxLines && width <= room && lines.length * size * lineHeight <= tall) return { ...input, size, lines, width, fits: true };
    }
    // Overhang at the minimum size instead of cutting the name: wrap to the unit, or to the longest word.
    const longest = Math.max(...input.name.split(/\s+/).map(word => textWidth(word, minSize)));
    let lines = wrap(input.name, minSize, Math.max(room, longest));
    if (lines.length > maxLines) lines = wrap(input.name, minSize, textWidth(input.name, minSize) / maxLines + longest * .5);
    return { ...input, size: minSize, lines, width: Math.max(...lines.map(line => textWidth(line, minSize))), fits: false };
  });
  candidates.sort((a, b) => Number(b.active) - Number(a.active) || Number(b.fits) - Number(a.fits) || b.area - a.area);
  const placed: (PlacedLabel & { box: [number, number, number, number] })[] = [];
  for (const label of candidates) {
    const height = label.lines.length * label.size * lineHeight, pad = label.size * .25;
    const box: [number, number, number, number] = [label.x - label.width / 2 - pad, label.y - height / 2 - pad, label.x + label.width / 2 + pad, label.y + height / 2 + pad];
    if (!label.active && placed.some(({ box: other }) => box[0] < other[2] && box[2] > other[0] && box[1] < other[3] && box[3] > other[1])) continue;
    placed.push({ id: label.id, x: label.x, y: label.y, size: label.size, lines: label.lines, active: label.active, box });
  }
  return placed.map(({ box, ...label }) => label);
}
