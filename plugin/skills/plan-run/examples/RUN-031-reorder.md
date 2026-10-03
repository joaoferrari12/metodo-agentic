# RUN-031: customers can order again from a past order

**Date:** 2026-03-14
**Status:** open
**Built by:** this session alone (asked at the start)

> Fictional example. "Crumb & Co." is an invented bakery; nothing here comes from a real system.

## What the run delivers

Regulars order the same thing every week and retype it every time. Half of the support messages in
the last month were "how do I order what I ordered last time". The run gives every past order an
*Order again* button that fills the cart, flags what is out of stock, and keeps prices current.

## Items and DONE

| # | Item | DONE (checkable without asking) |
|---|---|---|
| 1 | *Order again* on each past order | 360 px screen: tapping it on an order with 3 items opens the cart with the same 3 items and quantities |
| 2 | Out-of-stock lines are flagged, not dropped | Battery scenario `regular-with-sold-out-item` logs the line as flagged and the total without it |
| 3 | Prices are today's, not the old order's | Battery scenario `price-changed-since-last-order` logs the new total; an old-price total is a ❌ |
| 4 | Works for an order placed before the cart format changed | Saved fixture `fixtures/orders-v1.json` opens in the new cart with no error |

## Order

4 first: an old order that crashes the cart is the outage of this feature. Then 1, 3, 2.

## Commodity (copied, not discussed)

| What | Copied from |
|---|---|
| Button placement and label | The "Buy it again" pattern in large marketplaces: on the order card, secondary style |
| Partial availability message | Grocery apps: keep the line, grey it, say "sold out today" |

## Real decision touched

Price policy: today's price, never the old one (the owner decided this in RUN-012).

## Waiting on the human

Publishing the release. Nothing else.

---

## Verdict

<Written once, at the end, with `run-verdict`.>
