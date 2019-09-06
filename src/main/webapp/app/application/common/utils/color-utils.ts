const DEFAULT_COLORS = [
  '#1abc9c',
  '#4aa3df',
  '#8e44ad',
  '#c0392b',
  '#2c3e50',
  '#f39c12',
  '#16a085',
  '#7f8c8d',
  '#AA784D',
  '#589494',
  '#8BC34A',
  '#EF4DB6',
  '#7f14f6',
  '#4286f4',
  '#FF6633',
  '#FFB399',
  '#FF33FF',
  '#FFFF99',
  '#00B3E6',
  '#E6B333',
  '#3366E6',
  '#999966',
  '#99FF99',
  '#B34D4D',
  '#80B300',
  '#809900',
  '#E6B3B3',
  '#7b7b7b',
  '#66991A',
  '#FF99E6',
  '#CCFF1A',
  '#838383',
  '#E6331A',
  '#5ad6e7',
  '#cc385b',
  '#B366CC',
  '#3762db',
  '#B33300',
  '#2b6bea',
  '#66664D',
  '#991AFF',
  '#E666FF',
  '#4DB3FF',
  '#1AB399',
  '#E666B3',
  '#33991A',
  '#CC9999',
  '#B3B31A',
  '#00E680',
  '#4D8066',
  '#809980',
  '#ffdf00',
  '#1AFF33',
  '#999933',
  '#FF3380',
  '#CCCC00',
  '#66E64D',
  '#4D80CC',
  '#9900B3',
  '#E64D66',
  '#4DB380',
  '#FF4D4D',
  '#99E6E6',
  '#6666FF'
];

const sumChars = (str: string) => {
  if (!str) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
};

export const textToColor = (text: string, length: number = DEFAULT_COLORS.length) => {
  const colorIndex = sumChars(text) % length;
  return DEFAULT_COLORS[colorIndex];
};
