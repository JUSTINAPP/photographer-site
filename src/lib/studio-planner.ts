export const eventTypes = ['Shoot', 'Delivery', 'Meeting', 'Other'];
export const socialChannels = ['Instagram', 'LinkedIn', 'TikTok'];

export function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function validDay(value: string) {
  if (!/^[2-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(+date) && dayKey(date) === value;
}

// Monday-first, as in the Bowerbird production calendar.
export function addDays(day: string, amount: number) {
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount);
  return dayKey(date);
}

export function mondayOf(day: string) {
  return addDays(day, -((new Date(day + 'T12:00:00Z').getUTCDay() + 6) % 7));
}
