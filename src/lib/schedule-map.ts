import { geoAlbersUsa, geoDistance, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import boundaries from 'us-atlas/states-10m.json';
import tracks from '../data/tracks.json';
import selections from '../data/team-events.json';
import type { RaceEvent } from './schedule';

export const mapWidth = 960;
export const mapHeight = 600;
const topology = boundaries as unknown as Topology<{ states: GeometryCollection }>;
const states = feature(topology, topology.objects.states);
const projection = geoAlbersUsa().fitExtent([[32, 28], [mapWidth - 32, mapHeight - 28]], states);
export const mapPath = geoPath(projection)(states);

export function mapEvents(events: RaceEvent[], selectedIds: string[] = selections.selectedEventIds) {
  const eligible = events.filter((event) => Number(event.startDate.slice(0, 4)) >= 2027);
  const positions: { x: number; y: number }[] = [];
  return eligible.map((event) => {
    const track = tracks.find((track) => event.venue.startsWith(`${track.name},`));
    if (!track) throw new Error(`Add track coordinates for ${event.venue} in src/data/tracks.json`);
    const point = projection([track.longitude, track.latitude]);
    if (!point) throw new Error(`Track is outside US map: ${track.name}`);
    const siblings = eligible.filter((candidate) => candidate.venue === event.venue);
    const index = siblings.findIndex((candidate) => candidate.id === event.id);
    const angle = index * Math.PI * 2 / siblings.length - Math.PI / 2;
    const radius = siblings.length > 1 ? 26 : 0;
    let x = point[0] + Math.cos(angle) * radius;
    let y = point[1] + Math.sin(angle) * radius;
    let attempt = 0;
    while (positions.some((position) => Math.abs(position.x - x) < 52 && Math.abs(position.y - y) < 52)) {
      attempt++;
      if (attempt > 400) throw new Error(`Unable to place event marker: ${event.name}`);
      const offsetAngle = attempt * 2.399963229728653;
      const offsetRadius = 12 * Math.sqrt(attempt);
      x = Math.max(26, Math.min(mapWidth - 26, point[0] + Math.cos(offsetAngle) * offsetRadius));
      y = Math.max(26, Math.min(mapHeight - 26, point[1] + Math.sin(offsetAngle) * offsetRadius));
    }
    positions.push({ x, y });
    const preference = selections.preferredRadius;
    const distanceMiles = geoDistance(
      [preference.longitude, preference.latitude],
      [track.longitude, track.latitude],
    ) * 3958.7613;
    return {
      ...event,
      track,
      timeZone: track.timeZone,
      selected: selectedIds.includes(event.id) || distanceMiles <= preference.miles,
      x,
      y,
      trackX: point[0],
      trackY: point[1],
    };
  });
}