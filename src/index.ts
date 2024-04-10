import { Application, Assets, Sprite } from "pixi.js";
import Game from "./app/Game";

async function init() {
  const app = new Application();

  await app.init({
    background: "blue",
    // resizeTo: window,
    width: 1024,
    height: 768,
  });

  document.body.appendChild(app.canvas);

  const game = new Game(app);

  // app.ticker.add(game.update, game);
}

init();
