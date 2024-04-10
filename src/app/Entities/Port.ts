import { Application, Container, Graphics, Renderer } from "pixi.js";
import { Coordinates } from "../helpers/types";
import Dock from "./Dock";
import Queue from "./Queue";

export type DockType = {
  number: number;
  isFree: boolean;
  filled: number;
  coords: Coordinates;
};
const docsTempalte: DockType[] = [
  {
    isFree: true,
    filled: 0,
    coords: {
      x: 0,
      y: 30,
    },
    number: 0,
  },
  {
    isFree: true,
    filled: 0,
    coords: {
      x: 0,
      y: 210,
    },
    number: 1,
  },
  {
    isFree: true,
    filled: 0,
    coords: {
      x: 0,
      y: 390,
    },
    number: 2,
  },
  {
    isFree: true,
    filled: 0,
    coords: {
      x: 0,
      y: 570,
    },
    number: 3,
  },
];

type PortProps = {
  app: Application<Renderer>;
};

export default class Port extends Container {
  public EntranceCoordinates: Coordinates;
  public docs: Dock[];
  public isPortOpen: boolean;
  public linesState: {
    loadingLine: Queue;
    unloadingLine: Queue;
  };

  private app: Application<Renderer>;
  constructor(props: PortProps) {
    super();
    this.app = props.app;
    this.isPortOpen = true;

    this.EntranceCoordinates = {
      x: 300,
      y: 384,
    };

    //viev params
    const view = new Graphics();
    view.rect(300, 0, 10, 314).fill("yellow");
    view.rect(300, 474, 10, 314).fill("yellow");

    const loadingLine = new Queue({ type: "loading", port: this });
    const unloadingLine = new Queue({ type: "unloading", port: this });

    this.linesState = {
      loadingLine,
      unloadingLine,
    };

    this.docs = docsTempalte.map((dock, i) => {
      const dockObj = new Dock({
        app: this.app,
        coords: dock.coords,
        filled: dock.filled,
        isFree: dock.isFree,
        number: i,
      });

      this.addChild(dockObj);

      return dockObj;
    });

    this.addChild(view);
  }

  togglePortOpen(isOpen: boolean) {
    this.isPortOpen = isOpen;
  }
}
