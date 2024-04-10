import { Bounds } from "pixi.js";

export type Coordinates = {
  x: number;
  y: number;
};

export type CollisionObj = {
  getBounds(
    skipUpdate?: boolean | undefined,
    bounds?: Bounds | undefined
  ): Bounds;
};
