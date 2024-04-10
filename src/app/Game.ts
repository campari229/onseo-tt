import { Application, Renderer } from "pixi.js";
import Ship from "./Entities/Ship";
import Port from "./Entities/Port";

export default class Game {
  #pixiApp: Application<Renderer>;

  port: Port;
  private shipNumber: number;

  constructor(pixiApp: Application<Renderer>) {
    this.#pixiApp = pixiApp;
    const port = new Port({ app: this.#pixiApp });

    this.port = port;
    this.#pixiApp.stage.addChild(this.port);
    this.shipNumber = 0;

    setInterval(() => {
      this.shipNumber++;
      const ship = new Ship({
        type: Math.random() < 0.5 ? "in" : "out",
        app: this.#pixiApp,
        port,
        number: this.shipNumber,
      });

      this.#pixiApp.stage.addChild(ship);
    }, 8000);
  }

  update() {}
}
