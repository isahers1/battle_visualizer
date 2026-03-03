export const ANIMATION_DURATION = 800; // ms

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPosition(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t)];
}
