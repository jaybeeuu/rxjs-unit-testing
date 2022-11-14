import type { GameOptions, State } from "./alphabet-invasion";
import { makeGame$ } from "./alphabet-invasion";

const gameOptions: GameOptions = {
  levelChangeThreshold: 20,
  speedAdjust: 50,
  endThreshold: 15,
  gameWidth: 30
};

const renderGame = (state: State): void => {
  const rendered =[
    `Score: ${state.score}, Level: ${state.level}`,
    "-".repeat(gameOptions.gameWidth),
    ...state.letters.map(
      (l) => `${"&nbsp".repeat(l.xPos)}${l.letter}`
    ),
    ...Array.from({
      length: gameOptions.endThreshold - state.letters.length - 1
    }).fill(""),
    "-".repeat(gameOptions.gameWidth)
  ].join("<br/>");
  document.body.innerHTML = rendered;
};

const renderGameOver = (): void => {
  document.body.innerHTML += "<br/>GAME OVER!";
};

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    makeGame$(gameOptions).subscribe({
      next: renderGame,
      complete: renderGameOver
    });
  }
};
