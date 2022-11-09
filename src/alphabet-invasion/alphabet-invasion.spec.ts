import { interval } from "rxjs";
import type RxjsModule from "rxjs";
import type { GameOptions} from "./alphabet-invasion";
import { makeGame$ } from "./alphabet-invasion";
import { makeScheduler } from "../test";

jest.mock("rxjs", () => {
  const actual = jest.requireActual<typeof RxjsModule>("rxjs");
  return {
    ...actual,
    fromEvent: jest.fn(),
    interval: jest.fn()
  };
});

const makeGameOptions = (gameOptions: Partial<GameOptions> = {}): GameOptions => {
  return {
    levelChangeThreshold: 20,
    speedAdjust: 50,
    endThreshold: 15,
    gameWidth: 30,
    ...gameOptions
  };
};

describe("makeGame", () => {
  it("returns an observable", () => {
    makeScheduler().run(({
      cold,
      expectObservable
    }) => {
      jest.mocked(interval).mockImplementation(
        (delay = 0) => cold(`${delay}ms 1 ${delay}ms 2 ${delay}ms 3`)
      );

      expectObservable(makeGame$(makeGameOptions(), cold(""))).toBe(
        "600ms a 600ms b 600ms c",
        {
          a: { letters: [], score: 0, level: 1 },
          b: { letters: [], score: 0, level: 1 },
          c: { letters: [], score: 0, level: 1 }
        }
      );
    });
  });
});
