import { CollisionObj } from "./types";

export const doesItIntersect = (
  object1: CollisionObj,
  object2: CollisionObj,
  gap?: number
) => {
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return (
    bounds1.x < bounds2.x + bounds2.width + (gap || 0) &&
    bounds1.x + bounds1.width + (gap || 0) > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height + (gap || 0) &&
    bounds1.y + bounds1.height + (gap || 0) > bounds2.y
  );
};
