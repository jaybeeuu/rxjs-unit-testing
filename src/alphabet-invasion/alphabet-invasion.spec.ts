/**
 * @jest-environment jsdom
 */

import type { NextNotification, Observable } from "rxjs";
import type RxjsModule from "rxjs";
import { fromEvent, interval } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { makeScheduler } from "../test";
import type { GameOptions} from "./alphabet-invasion";
import { makeGame$ } from "./alphabet-invasion";
import { randomLetter, randomInt } from "./random";

jest.mock("rxjs", () => {
  const actual = jest.requireActual<typeof RxjsModule>("rxjs");
  return {
    ...actual,
    fromEvent: jest.fn(),
    interval: jest.fn()
  };
});

jest.mock("./random");

const makeGameOptions = (gameOptions: Partial<GameOptions> = {}): GameOptions => {
  return {
    levelChangeThreshold: 20,
    speedAdjust: 50,
    endThreshold: 15,
    gameWidth: 30,
    ...gameOptions
  };
};

const setupRandomLetters = (...sequence: string[]): void => {
  sequence.forEach((letter) => {
    jest.mocked(randomLetter).mockReturnValueOnce(letter);
  });
};

const setupRandomInts = (...sequence: number[]): void => {
  sequence.forEach((number) => {
    jest.mocked(randomInt).mockReturnValueOnce(number);
  });
};

type Cold = <T = string>(marbles: string, values?: {
  [marble: string]: T;
} | undefined, error?: any) => Observable<T>;

const setupKeyStrokes = (cold: Cold, marbles: string): void => {
  const events = Object.fromEntries(TestScheduler.parseMarbles(marbles)
    .map((message) => message.notification)
    .filter((notification): notification is NextNotification<string> => notification.kind === "N")
    .map(({ value: key }) => [key, new KeyboardEvent("keydown", { key })])
  );
  jest.mocked(fromEvent).mockReturnValue(cold(marbles, events));
};

const setupInterval = (cold: Cold, emissions: number): void => {
  jest.mocked(interval).mockImplementation(
    (delay = 0) => cold(
      Array.from(
        { length: emissions },
        (_, index) => `${delay}ms ${index}`
      ).join(" ")
    )
  );
};

describe("makeGame", () => {
  it("returns a series of game states with the letters shift into the top.", () => {
    makeScheduler().run(({
      cold,
      expectObservable
    }) => {
      setupRandomLetters("a", "b", "c");
      setupRandomInts(1, 2, 3);
      setupKeyStrokes(cold, "");
      setupInterval(cold, 3);

      expectObservable(makeGame$(
        makeGameOptions(),
      )).toBe(
        "600ms a 600ms b 600ms c",
        {
          a: { letters: [
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 },
          b: { letters: [
            { letter: "b", xPos: 2 },
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 },
          c: { letters: [
            { letter: "c", xPos: 3 },
            { letter: "b", xPos: 2 },
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 }
        }
      );
    });
  });

  it("doesn't remove letters if the wrong key is pressed.", () => {
    makeScheduler().run(({
      cold,
      expectObservable
    }) => {
      setupRandomLetters("a");
      setupRandomInts(1);
      setupInterval(cold, 1);
      setupKeyStrokes(cold, "800ms b");

      expectObservable(makeGame$(
        makeGameOptions()
      )).toBe(
        "600ms a 199ms a",
        {
          a: { letters: [
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 }
        }
      );
    });
  });

  it("remove the last letter if the matching key is pressed.", () => {
    makeScheduler().run(({
      cold,
      expectObservable
    }) => {
      setupInterval(cold, 1);
      setupRandomLetters("a");
      setupRandomInts(1);
      setupKeyStrokes(cold, "800ms a");

      expectObservable(makeGame$(
        makeGameOptions()
      )).toBe(
        "601ms a 199ms b",
        {
          a: { letters: [
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 },
          b: { letters: [], score: 1, level: 1 }
        }
      );
    });
  });

  it("does not remove the letter of the key if it is not the last.", () => {
    makeScheduler().run(({
      cold,
      expectObservable
    }) => {
      setupInterval(cold, 2);
      setupRandomLetters("a", "b");
      setupRandomInts(1, 2);
      setupKeyStrokes(cold, "1300ms b");

      expectObservable(makeGame$(
        makeGameOptions()
      )).toBe(
        "600ms a 600ms b 98ms b",
        {
          a: { letters: [
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 },
          b: { letters: [
            { letter: "b", xPos: 2 },
            { letter: "a", xPos: 1 }
          ], score: 0, level: 1 }
        }
      );
    });
  });
});
