# RxJS Unit Testing

This repo is the result of my exploration into unit testing [RxJS](https://rxjs.dev/).
In particular I wanted to get to know the
[marble diagram testing tools](https://rxjs.dev/guide/testing/marble-testing)
and apply them to a relatively complex scenario to see how they stand up.

I used the [alphabet-invasion-game](https://www.learnrxjs.io/learn-rxjs/recipes/alphabet-invasion-game) (props to [adamlubek](https://github.com/adamlubek)) as my more complex case.

You can find my write up on the [Scott logic blog](https://blog.scottlogic.com2023/2023/02/11/rxjs-unit-testing.html).

## Getting started here

I use [pnpm](https://pnpm.io/) (latest at the time of writing was v7.14.2) to manage my dependencies and of course you will need [node](https://nodejs.org/en/) (I used v18.14.0).

```sh
# Install dependencies
pnpm install

# Run the tests
pnpm test

# Start the vite dev server to see alphabet invasion running on http://localhost:5173/
pnpm start
```

That's it.
