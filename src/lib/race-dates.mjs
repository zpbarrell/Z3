const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseRaceDates(text) {
  const match = text.match(/^([A-Za-z]{3})\s+(\d{1,2})\s*-\s*([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!match) throw new Error(`Unrecognized event dates: ${text}`);
  const [, startMonth, startDay, endMonth, endDay, year] = match;
  const startIndex = months.indexOf(startMonth);
  const endIndex = months.indexOf(endMonth);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Unrecognized month: ${text}`);
  const startYear = Number(year) - (startIndex > endIndex ? 1 : 0);
  const iso = (dateYear, month, day) => {
    const date = new Date(Date.UTC(dateYear, month, Number(day)));
    if (date.getUTCMonth() !== month || date.getUTCDate() !== Number(day)) throw new Error(`Invalid event date: ${text}`);
    return date.toISOString().slice(0, 10);
  };
  return { startDate: iso(startYear, startIndex, startDay), endDate: iso(Number(year), endIndex, endDay) };
}

export function raceStatus(event, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: event.timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type) => parts.find((value) => value.type === type).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const days = Math.round((Date.parse(`${event.startDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
  const ended = event.endDate < today;
  const label = ended ? 'Completed' : days < 0 ? 'In progress' : days === 0 ? 'Starts today' : `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
  return { days, ended, soon: !ended && days >= 0 && days <= 30, label };
}