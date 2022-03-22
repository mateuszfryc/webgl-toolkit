const { random, round } = Math;

export const randomFloat = (min, max) => random() * (max - min) + min;
export const randomInt = (min, max) => round(randomFloat(min, max));
