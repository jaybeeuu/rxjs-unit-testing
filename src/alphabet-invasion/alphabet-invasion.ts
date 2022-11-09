import type { Observable } from "rxjs";
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

export interface GameOptions {
  levelChangeThreshold: number;
  speedAdjust: number;
  endThreshold: number;
  gameWidth: number;
}

const randomLetter = (): string => String.fromCharCode(
  Math.random() * ("z".charCodeAt(0) - "a".charCodeAt(0)) + "a".charCodeAt(0));

const getDocumentKey$ = (): Observable<string> => fromEvent<KeyboardEvent>(
  document,
  "keydown"
).pipe(
  startWith({ key: "" }),
  map((e: { key: string }) => e.key)
);

export const makeGame$ = (
  {
    levelChangeThreshold,
    speedAdjust,
    endThreshold,
    gameWidth
  }: GameOptions,
  key$: Observable<string> = getDocumentKey$()
): Observable<State> => {
  const intervalSubject = new BehaviorSubject(600);

  const letterState$ = intervalSubject.pipe(
    switchMap((i) => interval(i)
      .pipe(
        scan<number, Letters>((letters) => ({
          interval: i,
          letters: [({
            letter: randomLetter(),
            yPos: Math.floor(Math.random() * gameWidth)
          }), ...letters.letters]
        }), { letters: [], interval: 0 })
      )));

  return combineLatest([key$, letterState$]).pipe(
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
};
