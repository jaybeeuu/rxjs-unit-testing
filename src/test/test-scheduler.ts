import { TestScheduler } from "rxjs/testing";

export const makeScheduler = (): TestScheduler => new TestScheduler((actual, expected) => {
  expect(actual).toStrictEqual(expected);
});
