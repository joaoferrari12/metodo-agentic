---
name: right-and-wrong-battery
description: Builds a test battery that walks the whole flow with fictional scenarios or bot players, one per kind of person who uses the product, and writes a report of everything that is right AND everything that is wrong, deterministic so the numbers don't depend on machine load. Use when green checks keep missing what a real user finds, before a release, when a game needs balancing or tutorial testing, or when the user asks "does the whole thing actually work?".
---

# Battery that logs right and wrong

A green verifier answers "did anything I thought of break?". A battery answers "what does a person
of each kind see, from the first screen to the last?", and it writes down **what is right as well
as what is wrong**. A right that disappears from the report is a regression you can see before
anyone complains.

**Why.** In the project this method comes from, the owner, using the product as a shop owner would,
found a defect that **three green verifiers** had not caught. Each verifier checked its own piece;
nobody walked the flow. The battery was born the same day.

## Process

1. **List the people, not the functions.** One scenario per kind of person and situation:
   - Business app: the owner closing the day, the clerk in a rush, the customer on a phone, the
     returning customer whose data is from an older version.
   - Game: someone who never played, someone who plays well, someone who only follows the
     tutorial's hand, someone with a save from the previous release.
2. **Use fictional data only.** Invented businesses, invented players. Real data never enters a
   battery, so the report can be pasted anywhere.
3. **Make it deterministic.** Fixed seed, fixed number of workers, no timing that depends on how
   busy the machine is. If a number changes between two runs with the same seed, the battery is
   broken, not the product.
4. **Each step records what it saw.** `right(label, observed)` or `wrong(label, expected, observed)`.
   A thrown error is a wrong, never a crash of the battery.
5. **Write the report to a file and commit it** with the run. The report is evidence; evidence
   lives in git, not in a scratch folder.
6. **Gate on it.** Exit code 1 on any wrong, so `refusing-guard` can refuse a publish on it.
7. **Keep one saved file per published data format** (old saves, old exports) and make a scenario
   open each one with the new version. An update that corrupts someone's save is the outage of a game.

## Starting point

`${CLAUDE_SKILL_DIR}/scripts/battery.mjs` is a dependency-free harness:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/battery.mjs <folder with *.scenario.mjs> --seed 42 --out battery-report.md
```

A scenario is a module:

```js
export default {
  name: 'regular-with-sold-out-item',
  persona: 'returning customer, one item sold out today',
  async run(t) {
    const cart = reorder(pastOrder, todayStock, todayPrices)
    t.check('sold-out line is kept and flagged', cart.lines[1].flag === 'sold-out', 'sold-out', cart.lines[1].flag)
    t.check('total ignores the sold-out line', cart.total === 7.5, 7.5, cart.total)
  },
}
```

`t.rng()` gives a seeded random number, so a bot's choices repeat exactly. A full example with a
fictional bakery's reorder logic is in `${CLAUDE_SKILL_DIR}/examples/`; run
`node scripts/battery.mjs examples/scenarios` from the skill folder to see the report.

## Things only a human can confirm

Sound, "feel", frame rate on the real phone, whether a text reads well. The battery does not pretend:
the report ends with a **"to be checked by a human"** list, and nothing on it is called done.

## Red flags

- "All tests pass" as the answer to "does it work?".
- A report that only lists failures.
- Real customer data in a fixture.
- Results that change with the seed held fixed.
- A scenario per function instead of per person.
