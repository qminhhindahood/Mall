// Browser User Timing only; diagnostics must never determine readiness.
let sequence = 0;
const retained: string[] = [];
export function timing(name: string, detail: Record<string, unknown> = {}, startTime = performance.now()) {
  const id = ++sequence;
  const start = `mall-loading:${name}:start:${id}`;
  const end = `mall-loading:${name}:end:${id}`;
  const measure = `mall-loading:${name}:${id}`;
  performance.mark(start, { detail, startTime });
  let finished = false;
  return (outcome = 'ready', extra: Record<string, unknown> = {}) => {
    if (finished) return;
    finished = true;
    performance.mark(end, { detail: { ...detail, ...extra, outcome } });
    performance.measure(measure, { start, end, detail: { operation: name, ...detail, ...extra, outcome } });
    retained.push(start, end, measure);
    while (retained.length > 600) {
      const oldest = retained.shift()!;
      performance.clearMarks(oldest);
      performance.clearMeasures(oldest);
    }
  };
}
