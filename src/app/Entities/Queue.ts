import { Container } from "pixi.js";
import Ship from "./Ship";
import { Coordinates } from "../helpers/types";
import Port from "./Port";

type QueueProps = {
  type: "loading" | "unloading";
  port: Port;
};

export default class Queue extends Container {
  public type: "loading" | "unloading";
  public ShipsLine: Ship[];
  public freePlaceCoords: Coordinates;

  private port: Port;

  constructor(props: QueueProps) {
    super();
    this.type = props.type;
    this.port = props.port;
    this.ShipsLine = [];
    this.freePlaceCoords = {
      x: 380,
      y: this.type === "loading" ? 220 : 510,
    };

    this.x = this.freePlaceCoords.x;
    this.y = this.freePlaceCoords.y;

    this.checkLine();
  }

  public setShipInLine(shipToAdd: Ship) {
    this.ShipsLine = [...this.ShipsLine, shipToAdd];

    // this.freePlaceCoords.x += 100;
  }

  public removeShipFromLine(shipToRemove: Ship) {
    this.ShipsLine = this.ShipsLine.filter(
      (ship) => ship.shipNumber !== shipToRemove.shipNumber
    );

    // this.freePlaceCoords.x = -100;
  }

  checkLine() {
    setInterval(() => {
      const firstShipInLine = this.ShipsLine[0];
      if (!firstShipInLine) return;

      if (this.port.isPortOpen) {
        const dockToGo = this.port.docs.find((dock, i) => {
          if (!dock.isFree) return false;
          if (firstShipInLine.filled) {
            return !dock.filled;
          } else {
            return dock.filled;
          }
        });

        if (dockToGo) {
          firstShipInLine.moveFromLine(dockToGo);
          this.removeShipFromLine(firstShipInLine);
          this.lineMove();
        }
      }
    }, 2000);
  }

  lineMove() {
    this.ShipsLine.forEach((ship, i) => {
      ship.moveInLine({
        x: 380 + i * 100,
        y: this.freePlaceCoords.y,
      });
    });
  }
}
