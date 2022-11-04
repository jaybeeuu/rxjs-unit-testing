export interface RandomIntOptions {
  /** The smallest, inclusive, number that will be generated. */
  min?: number;
  /** The largest number, exclusive, that will be generated. */
  max?: number;
}

/**
 * Generates a number between two values.
 * @param {RandomIntOptions} options - Min is defaulted to 0, max to 10.
 * @returns A number between min and max.
 */
export const randomInt = (
  {
    min = 0,
    max = 10
  }: RandomIntOptions = {}
): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

/** Generates a random lowercase letter. */
export const randomLetter = (): string => String.fromCharCode(
  randomInt({ min: "a".charCodeAt(0), max: "z".charCodeAt(0) })
);
