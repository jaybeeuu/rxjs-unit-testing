import { Observable, of } from "rxjs";
import { concatMap, delay } from "rxjs/operators";

export const spread = (delayTime: number) => (observable: Observable<string>) => observable.pipe(
  concatMap((value: string) => {
    return of(value).pipe(delay(delayTime));
  })
);

