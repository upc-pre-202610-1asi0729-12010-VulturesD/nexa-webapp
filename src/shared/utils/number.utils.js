export const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const clamp = (value, min, max) => Math.min(Math.max(toNumber(value), min), max);

export const roundMoney = (value) => Math.round(toNumber(value) * 100) / 100;
