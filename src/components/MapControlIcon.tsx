/** Shared presentation only; the explorer owns every map action and state. */
export default function MapControlIcon({kind}: {kind:'out'|'in'|'angle'|'reset'}) {
  const paths={out:'M5 12h14',in:'M5 12h14M12 5v14',angle:'m3 9 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5',reset:'M5 9a8 8 0 1 1 0 6M5 4v5h5'};
  return <svg className="map-control-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[kind]}/></svg>;
}
