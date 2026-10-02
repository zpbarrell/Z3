import { raceStatus } from '../lib/race-dates.mjs';
import type { mapEvents } from '../lib/schedule-map';

export function initializeScheduleMap(root: HTMLElement) {
  const races: ReturnType<typeof mapEvents> = JSON.parse(root.querySelector('[data-race-data]')!.textContent!);
  const detail = root.querySelector<HTMLElement>('#race-detail');
  if (!detail) return;
  let activeId: string | null = null;

  function showDetails(id: string, focus = false) {
    const event = races.find((event) => event.id === id);
    if (!event) return;
    activeId = id;
    const text = (selector: string, value: string) => { root.querySelector(selector)!.textContent = value; };
    text('#race-detail-title', event.name);
    text('[data-detail-date]', event.dates);
    text('[data-detail-course]', event.venue);
    text('[data-detail-deadline]', event.deadline);
    text('[data-detail-description]', event.track.description ?? 'Course notes are not available yet. Check the track website and event details for layout, turns, elevation, and surface information.');
    text('[data-detail-countdown]', `${event.selected ? 'Team preference / ' : ''}${raceStatus(event).label}`);
    root.querySelector<HTMLAnchorElement>('[data-detail-event]')!.href = event.url;
    root.querySelector<HTMLAnchorElement>('[data-detail-track]')!.href = event.track.source;
    root.querySelectorAll<HTMLButtonElement>('button[data-event-id]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.eventId === id)));
    detail!.hidden = false;
    if (focus) {
      detail!.focus({ preventScroll: true });
      detail!.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }

  function refresh() {
    for (const event of races) {
      const status = raceStatus(event);
      root.querySelector<HTMLElement>(`[data-event-row="${event.id}"]`)!.hidden = status.ended;
      root.querySelector(`[data-countdown="${event.id}"]`)!.textContent = status.label;
      const marker = root.querySelector<HTMLButtonElement>(`.race-marker[data-event-id="${event.id}"]`)!;
      marker.hidden = status.ended;
      marker.classList.toggle('is-soon', status.soon);
      root.querySelector<SVGElement>(`.marker-leader[data-event-id="${event.id}"]`)!.style.display = status.ended ? 'none' : '';
    }
    if (activeId) showDetails(activeId);
  }

  root.querySelectorAll<HTMLButtonElement>('button[data-event-id]').forEach((button) => {
    button.addEventListener('click', () => showDetails(button.dataset.eventId!, true));
  });
  refresh();
  const timer = window.setInterval(refresh, 60000);
  const visibilityChanged = () => { if (!document.hidden) refresh(); };
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('pagehide', () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', visibilityChanged);
  }, { once: true });
}