import { reorder } from '../bakery.mjs'

export default {
  name: 'regular-with-sold-out-item',
  persona: 'returning customer, one item sold out today',
  async run(t) {
    const past = { v: 2, lines: [{ sku: 'sourdough', qty: 1 }, { sku: 'croissant', qty: 3 }] }
    const cart = reorder(past, { sourdough: 0, croissant: 30 }, { sourdough: 6, croissant: 2.5 })
    t.check('sold-out line is kept and flagged', cart.lines[0].flag === 'sold-out', 'sold-out', cart.lines[0].flag)
    t.check('total ignores the sold-out line', cart.total === 7.5, 7.5, cart.total)
  },
}
