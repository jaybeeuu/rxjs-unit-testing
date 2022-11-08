import { interval, fromEvent, combineLatest, BehaviorSubject } from "rxjs";
import { scan, startWith, map, takeWhile, switchMap } from "rxjs/operators";

export interface Letter {
  letter: string;
  yPos: number;
}
export interface Letters {
  letters: Letter[];
  interval: number;
}
export interface State {
  score: number;
  letters: Letter[];
  level: number;
}

const levelChangeThreshold = 20;
const speedAdjust = 50;
const endThreshold = 15;
const gameWidth = 30;
const intervalSubject = new BehaviorSubject(600);

const randomLetter = (): string => String.fromCharCode(
  Math.random() * ("z".charCodeAt(0) - "a".charCodeAt(0)) + "a".charCodeAt(0));

const letterState$ = intervalSubject.pipe(
  switchMap(i => interval(i)
    .pipe(
      scan<number, Letters>((letters) => ({
        interval: i,
        letters: [({
          letter: randomLetter(),
          yPos: Math.floor(Math.random() * gameWidth)
        }), ...letters.letters]
      }), { letters: [], interval: 0 })
    )));

const keys$ = fromEvent<KeyboardEvent>(document, "keydown")
  .pipe(
    startWith({ key: "" }),
    map((e: { key: string }) => e.key)
  );

const game$ = combineLatest([keys$, letterState$]).pipe(
  scan<[string, Letters], State>(
    (state, [key, latterState]) => {
      const { letter } = latterState.letters.at(-1) ?? {};

      if (letter && letter === key)
      {
        state.score = state.score + 1;
        latterState.letters.pop();
      }

      if (state.score > 0 && state.score % levelChangeThreshold === 0) {
        latterState.letters = [];
        state.level = state.level + 1;
        state.score = state.score + 1;
        intervalSubject.next(latterState.interval - speedAdjust);
      }

      return { score: state.score, letters: latterState.letters, level: state.level };
    },
    { score: 0, letters: [], level: 1 }),
  takeWhile(state => state.letters.length < endThreshold),
);

const appendToDocumentHtml = (html: string): void => {
  document.body.innerHTML += html;
};
const renderGame = (state: State): void => {
  document.body.innerHTML = `Score: ${state.score}, Level: ${state.level} <br/>`,
  state.letters.forEach(l => document.body.innerHTML
    = `${document.body.innerHTML}${"&nbsp".repeat(l.yPos)}${l.letter}<br/>`),
  appendToDocumentHtml(
    `${"<br/>".repeat(endThreshold - state.letters.length - 1)}${"-".repeat(gameWidth)}`
  );
};
const renderGameOver = (): void => appendToDocumentHtml("<br/>GAME OVER!");

game$.subscribe({
  next: renderGame,
  complete: renderGameOver
});
