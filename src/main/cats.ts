export interface CatDef {
  id: string;
  name: string;
  /** How many frames sprites/<id>/walk/frame_N.png has. */
  walkFrames: number;
}

/** Order matters: "number of cats" = N activates the first N of these, 08 always included. */
export const CATS: CatDef[] = [
  { id: "08", name: "08", walkFrames: 4 },
  { id: "biscuit", name: "Biscuit", walkFrames: 8 },
  { id: "ash", name: "Ash", walkFrames: 8 },
  { id: "mocha", name: "Mocha", walkFrames: 8 },
];

export function activeCats(count: number): CatDef[] {
  return CATS.slice(0, Math.max(1, Math.min(count, CATS.length)));
}
