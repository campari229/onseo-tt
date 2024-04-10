import { Application, Container, Graphics, Renderer, Ticker } from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import Port, { DockType } from "./Port";
import { Coordinates } from "../helpers/types";
import { variables } from "../helpers/vars";
import Dock from "./Dock";
import Queue from "./Queue";

type ShipPropsType = {
  type: "in" | "out";
  app: Application<Renderer>;
  port: Port;
  number: number;
};

export default class Ship extends Container {
  private coords: Coordinates;
  private app: Application<Renderer>;
  private port: Port;
  private container: Graphics;
  private filling: Graphics;
  private type: "in" | "out";

  public filled: number;
  public shipNumber: number;

  constructor(props: ShipPropsType) {
    super();
    // initial state
    this.app = props.app;
    this.port = props.port;
    this.coords = {
      x: 900,
      y: 300,
    };

    this.shipNumber = props.number;
    this.type = props.type;
    this.filled = this.type === "in" ? 100 : 0;

    this.x = this.coords.x;
    this.y = this.coords.y;

    //view params
    this.container = new Graphics();
    this.container
      .rect(0, 0, variables.shipLength, variables.shipWidth)
      .stroke({ width: 3, color: this.type === "in" ? "red" : "lightgreen" });

    this.filling = new Graphics();
    this.filling.rect(
      0,
      0,
      this.filled ? variables.shipLength : 0.0001,
      variables.shipWidth
    );
    this.filling.fill({ color: this.type === "in" ? "red" : "lightgreen" });

    this.addChild(this.filling);
    this.addChild(this.container);

    this.moveToPort(this.port.EntranceCoordinates);
  }

  moveToPort(coords: Coordinates) {
    const shipTween = new TWEEN.Tween(this.coords);

    shipTween
      .to({ x: coords.x, y: coords.y - 40 }, 6000)
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start();

    shipTween.onComplete(() => {
      const dockToGo = this.port.docs.find((dock, i) => {
        if (!dock.isFree) return false;
        if (this.filled) {
          return !dock.filled;
        } else {
          return dock.filled;
        }
      });

      if (!dockToGo || !this.port.isPortOpen) {
        this.goToLine(
          this.type === "in"
            ? this.port.linesState.unloadingLine
            : this.port.linesState.loadingLine
        );
      } else if (dockToGo) {
        this.moveToDock(dockToGo);
      }
    });

    this.app.ticker.add(() => {
      shipTween.update();
    });
  }

  goToLine(line: Queue) {
    const isLoadingLine = line.type === "loading";

    const placeToGo: Coordinates = {
      x: line.freePlaceCoords.x + line.ShipsLine.length * 100,
      y: line.freePlaceCoords.y,
    };

    line.setShipInLine(this);
    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y })
      .to({
        x: this.x + variables.shipWidth,
        y: isLoadingLine ? placeToGo.y + 40 : placeToGo.y - 40,
      })
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start()
      .onComplete((coords) => {
        const moveTween = new TWEEN.Tween({ x: coords.x, y: coords.y });

        moveTween
          .to({ y: coords.y, x: placeToGo.x })
          .onUpdate((coords) => {
            this.position.set(coords.x, coords.y);
          })
          .start()
          .onComplete((coords) => {
            const moveTween = new TWEEN.Tween({ x: coords.x, y: coords.y });

            moveTween
              .to({ x: coords.x, y: placeToGo.y })
              .onUpdate((coords) => {
                this.position.set(coords.x, coords.y);
              })
              .start();

            this.app.ticker.add(() => {
              moveTween.update();
            });
          });

        this.app.ticker.add(() => {
          moveTween.update();
        });
      });

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }

  turnToDock(dock: Dock, move: "in" | "out") {
    let angle;
    switch (dock.number) {
      case 0:
        angle = 60;
        break;
      case 1:
        angle = 30;
        break;
      case 2:
        angle = -30;
        break;
      case 3:
        angle = -60;
        break;
    }

    const spinTween = new TWEEN.Tween({ rot: move === "in" ? 0 : angle });

    spinTween
      .to({ rot: move === "in" ? angle : 0 }, 500)
      .onUpdate((coords) => {
        if (coords.rot) {
          this.angle = coords.rot;
        }
      })
      .start();

    this.app.ticker.add(() => {
      spinTween.update();
    });
  }

  moveToDock(dock: Dock) {
    this.port.togglePortOpen(false);
    dock.occupyTheDock(true);
    this.turnToDock(dock, "in");

    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

    moveTween
      .to({ x: dock.coords.x + 80, y: dock.coords.y + 60 }, 2000)
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start()
      .onComplete(() => {
        this.turnToDock(dock, "out");
        this.dockConnect(dock, "in");
      });

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }

  dockConnect(dock: Dock, type: "in" | "out") {
    this.port.togglePortOpen(true);
    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

    moveTween
      .to({ x: dock.coords.x + (type === "in" ? 50 : 80), y: dock.coords.y })
      .onUpdate((coords) => {
        this.position.set(coords.x, this.y);
      })
      .start()
      .onComplete(() => {
        if (type === "in") {
          this.loadGoods(dock);
        } else {
          this.turnToDock(dock, "in");
          this.leaveDock(dock);
        }
      });

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }

  loadGoods(dock: Dock) {
    const isLoading = !this.filled;
    const loadTween = new TWEEN.Tween({ width: isLoading ? 0 : 90 });

    dock.loadDock();
    loadTween
      .to({ width: !isLoading ? 0 : 90 }, variables.loadUnloadTime)
      .onUpdate(({ width }) => {
        this.filling.width = width;
      })
      .start()
      .onComplete(() => {
        this.dockConnect(dock, "out");
      });

    this.app.ticker.add(() => {
      loadTween.update();
    });
  }

  leaveDock(dock: Dock) {
    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

    moveTween
      .to(
        {
          x: this.port.EntranceCoordinates.x - (variables.shipLength + 10),
          y: this.port.EntranceCoordinates.y + 20,
        },
        2000
      )
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start()
      .onComplete(() => {
        this.turnToDock(dock, "out");
        dock.occupyTheDock(false);

        const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

        moveTween
          .to({ x: 1000 }, 5000)
          .onUpdate(({ x }) => {
            this.position.set(x, this.y);
          })
          .start()
          .onComplete(() => {
            this.removeFromParent();
          });

        this.app.ticker.add(() => {
          moveTween.update();
        });
      });

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }

  moveFromLine(dock: Dock) {
    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

    moveTween
      .to({
        x: this.port.EntranceCoordinates.x,
        y: this.port.EntranceCoordinates.y,
      })
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start()
      .onComplete(() => {
        this.moveToDock(dock);
      });

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }

  moveInLine(lineCoords: Coordinates) {
    const moveTween = new TWEEN.Tween({ x: this.x, y: this.y });

    moveTween
      .to({
        x: lineCoords.x,
        y: lineCoords.y,
      })
      .onUpdate((coords) => {
        this.position.set(coords.x, coords.y);
      })
      .start();

    this.app.ticker.add(() => {
      moveTween.update();
    });
  }
}
