export const toDate = (value) => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const daysBetween = (from, to) => {
  const start = toDate(from);
  const end = toDate(to);
  return Math.ceil((end - start) / 86400000);
};

export const isExpired = (date, reference = new Date()) => daysBetween(reference, date) < 0;

export const isWithinDays = (date, days, reference = new Date()) => {
  const remaining = daysBetween(reference, date);
  return remaining >= 0 && remaining <= days;
};
