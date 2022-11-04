import { combineLatest, delay } from "rxjs";
import { spread } from "./simple";
import { makeScheduler } from "./test";

describe("delay", () => {
  it("delays each emission.", () => {
    makeScheduler().run(({ cold, expectObservable }) => {
      const source = cold("1-2-3|");
      const expected = "   300ms 1-2-(3|)";
      expectObservable(source.pipe(
        delay(300)
      )).toBe(expected);
    });
  });
});

describe("spread", () => {
  it("adds a delay between each emission.", () => {
    makeScheduler().run(({ cold, expectObservable }) => {
      const source = cold("1 2 3|");
      const expected = "   - 299ms 1 299ms 2 299ms (3|)";
      expectObservable(source.pipe(
        spread(300)
      )).toBe(expected);
    });
  });
});

describe("combineLatest", () => {
  it("combines the latest value from each of the sources, in to an array.", () => {
    makeScheduler().run(({ cold, expectObservable }) => {
      const sourceOne = cold("1-2-3");
      const sourceTwo = cold("-4-5-6");
      const expected = ["     -abcde", {
        a: ["1", "4"],
        b: ["2", "4"],
        c: ["2", "5"],
        d: ["3", "5"],
        e: ["3", "6"]
      }] as const;
      expectObservable(combineLatest([
        sourceOne,
        sourceTwo
      ])
      ).toBe(...expected);
    });
  });
});

describe("realistic", () => {
it("adds a delay between each emission.", () => {
    makeScheduler().run(({ cold, expectObservable }) => {
      const sourceOne = cold("1-2-3");
      const sourceTwo = cold("-4-5-6");
      const expected = ["     -abcde", {
        a: ["1", "4"],
        b: ["2", "4"],
        c: ["2", "5"],
        d: ["3", "5"],
        e: ["3", "6"]
      }] as const;
      expectObservable(combineLatest([
        sourceOne,
        sourceTwo
      ])
      ).toBe(...expected);
    });
  });
});
