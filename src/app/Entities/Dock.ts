import { Application, Container, Graphics, Renderer } from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import { Coordinates } from "../helpers/types";
import { variables } from "../helpers/vars";

type DockProps = {
  app: Application<Renderer>;
  coords: Coordinates;
  filled: number;
  isFree: boolean;
  number: number;
};

export default class Dock extends Container {
  private app: Application<Renderer>;
  //   private port: Port;
  private container: Graphics;
  private filling: Graphics;
  public number: number;
  public isFree: boolean;
  public filled: number;
  public coords: Coordinates;

  constructor(props: DockProps) {
    super();

    this.app = props.app;
    this.isFree = props.isFree;
    this.filled = 0;
    this.number = props.number;
    this.coords = {
      x: props.coords.x,
      y: props.coords.y,
    };

    this.x = this.coords.x;
    this.y = this.coords.y;

    //view params
    this.container = new Graphics();
    this.container.rect(0, 0, 50, 150).stroke({ width: 6, color: "yellow" });

    this.filling = new Graphics();
    this.filling.rect(0, 0, 50, 0.0001);
    this.filling.fill({ color: "yellow" });
    this.filling.y = 150;
    this.filling.x = 50;
    this.filling.angle = 180

    this.addChild(this.filling);
    this.addChild(this.container);
  }

  public loadDock() {
    const isLoading = !this.filled;
    const loadTween = new TWEEN.Tween({ height: isLoading ? 0.0001 : 150 });
    this.filling.height = 150;

    loadTween
      .to({ height: !isLoading ? 0.0001 : 150 }, variables.loadUnloadTime)
      .onUpdate(({ height }) => {
        this.filling.height = height;
      })
      .start()
      .onComplete(() => {
        this.filled = isLoading ? 100 : 0;
      });

    this.app.ticker.add(() => {
      loadTween.update();
    });
  }

  public occupyTheDock(occupy: boolean) {
    this.isFree = !occupy
  } 
}
