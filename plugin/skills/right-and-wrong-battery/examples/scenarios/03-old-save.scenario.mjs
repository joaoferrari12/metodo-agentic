import { reorder } from '../bakery.mjs'

export default {
  name: 'order-from-before-the-format-change',
  persona: 'customer whose last order is in the old format',
  async run(t) {
    const v1 = { lines: [{ sku: 'baguette', qty: '2' }] } // saved by the previous release
    const cart = reorder(v1, { baguette: 5 }, { baguette: 3 })
    t.check('old order opens without error', cart.lines.length === 1, 1, cart.lines.length)
    t.check('quantity became a number', cart.lines[0].qty === 2, 2, cart.lines[0].qty)
    t.check('priced with today\'s price', cart.total === 6, 6, cart.total)
  },
}
