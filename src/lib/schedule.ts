import { load } from 'cheerio';
import { parseRaceDates } from './race-dates.mjs';

export const scheduleUrl = 'https://24hoursoflemons.com/schedule/';

export interface RaceEvent {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
  venue: string;
  dates: string;
  deadline: string;
  url: string;
}

export function parseSchedule(html: string): RaceEvent[] {
  const document = load(html);
  const events = new Map<string, RaceEvent>();

  document('.container.d-none.d-md-flex').each((_index, element) => {
    const row = document(element);
    const headings = row.find('h4');
    const raceLink = row.find('a[href*="/race/?id="]').first();
    if (headings.length !== 2 || !raceLink.length) return;

    const url = new URL(raceLink.attr('href')!, scheduleUrl).href;
    const dateLink = row.find('p a').first();
    const dateParts = dateLink.contents().toArray()
      .filter((node) => node.type === 'text')
      .map((node) => document(node).text().trim())
      .filter(Boolean);
    const event = {
      id: new URL(url).searchParams.get('id')!,
      ...parseRaceDates(dateParts[0] ?? ''),
      name: headings.eq(1).text().trim(),
      venue: headings.eq(0).text().trim(),
      dates: dateParts[0] ?? '',
      deadline: dateParts[1]?.replace(/^Entry Deadline:\s*/, '') ?? '',
      url,
    };
    if (!event.name || !event.venue || !event.dates || !event.deadline) {
      throw new Error('The official race schedule markup has changed.');
    }
    events.set(url, event);
  });

  if (!events.size) throw new Error('No races found in the official schedule.');
  return [...events.values()];
}

export async function fetchSchedule() {
  const response = await fetch(scheduleUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Schedule request failed: ${response.status}`);
  return { events: parseSchedule(await response.text()), updatedAt: new Date().toISOString() };
}