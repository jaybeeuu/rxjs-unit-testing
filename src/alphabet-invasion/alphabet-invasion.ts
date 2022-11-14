import type { Observable } from "rxjs";
import { interval, fromEvent, combineLatest, BehaviorSubject } from "rxjs";
import { scan, startWith, map, takeWhile, switchMap } from "rxjs/operators";
import { randomInt, randomLetter } from "./random";

export interface Letter {
  letter: string;
  xPos: number;
}

interface Letters {
  letters: Letter[];
  interval: number;
}

export interface State {
  score: number;
  letters: Letter[];
  level: number;
}

export interface GameOptions {
  levelChangeThreshold: number;
  speedAdjust: number;
  endThreshold: number;
  gameWidth: number;
}

export const makeGame$ = (
  {
    levelChangeThreshold,
    speedAdjust,
    endThreshold,
    gameWidth
  }: GameOptions
): Observable<State> => {
  const intervalSubject = new BehaviorSubject(600);

  const letterState$ = intervalSubject.pipe(
    switchMap((i) => interval(i)
      .pipe(
        scan<number, Letters>((letters) => ({
          interval: i,
          letters: [
            {
              letter: randomLetter(),
              xPos: randomInt({ max: gameWidth })
            },
            ...letters.letters
          ]
        }), { letters: [], interval: 0 })
      )));

  const key$ = fromEvent<KeyboardEvent>(
    document,
    "keydown"
  ).pipe(
    map((e: { key: string }) => e.key),
    startWith("")
  );

  return combineLatest([key$, letterState$]).pipe(
    scan<[string, Letters], State>(
      (oldState, [key, letterState]) => {
        const newState = { ...oldState };

        const { letter: targetLetter } = letterState.letters.at(-1) ?? {};
        if (targetLetter && targetLetter === key) {
          newState.score = newState.score + 1;
          letterState.letters.pop();
        }

        if (newState.score > 0 && newState.score % levelChangeThreshold === 0) {
          letterState.letters = [];
          newState.level = newState.level + 1;
          newState.score = newState.score + 1;
          intervalSubject.next(letterState.interval - speedAdjust);
        }

        return { ...newState, letters: [...letterState.letters] };
      },
      { score: 0, letters: [], level: 1 }),
    takeWhile(state => state.letters.length < endThreshold),
  );
};
