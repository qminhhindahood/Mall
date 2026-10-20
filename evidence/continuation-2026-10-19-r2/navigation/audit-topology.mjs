import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const out = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const root = path.resolve(out, '../../..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const archive = 'docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-floorPlanMap-en.json';
const historical = read(archive).items.map(item => {
  const features = JSON.parse(item.properties.layout).features;
  const relevant = features.filter(f => /escalator|elevator|lift|entrance|door|exit|corridor|stair/i.test(JSON.stringify(f.properties)) || f.geometry?.type === 'LineString');
  return { floor: item.properties.floor, features: features.length, candidates: relevant.map(f => ({id: f.id ?? null, properties: f.properties, geometryType: f.geometry?.type, coordinateCount: f.geometry?.coordinates?.length})) };
});
const malls = ['saigon-centre', 'vincom-dong-khoi'].map(mall => {
  const directoryPath = `data/malls/${mall}/directory.json`;
  const geometryPath = `data/malls/${mall}/floor-geometry.json`;
  const directory = read(directoryPath), geometry = read(geometryPath);
  const floors = geometry.floors.map(f => f.id);
  let locations = 0, held = 0, multiFloor = 0;
  for (const destination of directory.destinations) {
    if (destination.floors.length > 1) multiFloor++;
    for (const floor of destination.floors) {
      locations++;
      const loc = destination.locations.find(l => l.floorId === floor);
      if (loc.certainty === 'floor-confirmed') held++;
    }
  }
  return {mall, floors, destinations: directory.destinations.length, locations, floorOnlyLocations: held, multiFloorDestinations: multiFloor, publishedFacilities: directory.facilities, frame: geometry.frame, regionRoles: [...new Set(geometry.floors.flatMap(f => f.regions.map(r => r.role)))], sources: geometry.floors.map(f => ({floor: f.id, sources: f.sources})), hashes: {[directoryPath]:hash(directoryPath), [geometryPath]:hash(geometryPath)}};
});
fs.writeFileSync(path.join(out,'topology-audit.json'),JSON.stringify({scope:'Archived local evidence; no on-site or fresh website verification', archive, archiveSha256:hash(archive), historicalSaigonFeatures:historical, malls, conclusion:'No validated walkable topology, paired floor connectors, accessibility attributes or surveyed registration. Ship floor comparison only.'},null,2));
const inventory = {scope:'Static data inventory only; behavior acceptance belongs to browser validation', malls:malls.map(({mall,destinations,locations,floorOnlyLocations,multiFloorDestinations})=>({mall,destinations,locations,floorOnlyLocations,multiFloorDestinations}))};
fs.writeFileSync(path.join(out,'data-inventory.json'),JSON.stringify(inventory,null,2));
console.log(JSON.stringify(inventory));
