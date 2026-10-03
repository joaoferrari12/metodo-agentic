import { reorder } from '../bakery.mjs'

// A bot that builds random past orders from a seeded RNG: same seed, same orders, same report.
export default {
  name: 'bot-200-random-reorders',
  persona: 'bot, 200 random past orders against random stock',
  async run(t) {
    const skus = ['sourdough', 'croissant', 'baguette', 'muffin']
    const prices = { sourdough: 6, croissant: 2.5, baguette: 3, muffin: 3.25 }
    let negative = 0, flaggedButCounted = 0
    for (let i = 0; i < 200; i++) {
      const lines = skus.filter(() => t.rng() < 0.6).map((sku) => ({ sku, qty: 1 + Math.floor(t.rng() * 5) }))
      const stock = Object.fromEntries(skus.map((s) => [s, Math.floor(t.rng() * 6)]))
      const cart = reorder({ v: 2, lines }, stock, prices)
      if (cart.total < 0) negative++
      const expected = cart.lines.filter((l) => l.flag === 'ok').reduce((s, l) => s + l.qty * l.price, 0)
      if (Math.abs(expected - cart.total) > 0.005) flaggedButCounted++
    }
    t.check('no negative totals in 200 carts', negative === 0, 0, negative)
    t.check('sold-out lines never counted in the total', flaggedButCounted === 0, 0, flaggedButCounted)
  },
}
