import { Application, Assets, Sprite } from "pixi.js";

async function init() {
  const app = new Application();

  await app.init({ background: "#1099bb", resizeTo: window });

  document.body.appendChild(app.canvas);
}

init();
