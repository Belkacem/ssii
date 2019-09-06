export const formatNumber = number => {
  const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
  const tier = (Math.log10(number) / 3) | 0;
  if (tier === 0) return number.toFixed(2);
  return (number / Math.pow(10, tier * 3)).toFixed(2) + SI_SYMBOL[tier];
};

export const moneyFormatter = number => formatNumber(number) + ' €';
