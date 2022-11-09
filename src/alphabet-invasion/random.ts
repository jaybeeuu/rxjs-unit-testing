export const randomInt = ({
  min = 0,
  max = 10
}: { min?: number, max?: number } = {}): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const randomLetter = (): string => String.fromCharCode(
  randomInt({ min: "a".charCodeAt(0), max: "z".charCodeAt(0) })
);
