/** Consumable category dots. */
export const catColor: Record<string, string> = {
  Elixir: '#B98BFF',
  Flask: '#FF6B5E',
  Potion: '#5FC9F8',
  Food: '#FFB347',
  Poison: '#7BE06B',
  Protection: '#8FA3B8',
  Engineering: '#FFF468',
  Stone: '#C8A2FF',
  Zandalar: '#E8845B',
  Misc: '#8E8E9A',
};

export const dotFor = (cat: string) => catColor[cat] ?? 'var(--faint)';
