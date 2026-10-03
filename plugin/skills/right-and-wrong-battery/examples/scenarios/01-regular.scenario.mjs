import { reorder } from '../bakery.mjs'

export default {
  name: 'regular-same-as-last-week',
  persona: 'returning customer, everything in stock',
  async run(t) {
    const past = { v: 2, lines: [{ sku: 'sourdough', qty: 1 }, { sku: 'croissant', qty: 4 }] }
    const cart = reorder(past, { sourdough: 10, croissant: 30 }, { sourdough: 6, croissant: 2.5 })
    t.check('same items, same quantities', cart.lines.map((l) => `${l.qty}x ${l.sku}`).join(', ') === '1x sourdough, 4x croissant', '1x sourdough, 4x croissant', cart.lines.map((l) => `${l.qty}x ${l.sku}`).join(', '))
    t.check('total', cart.total === 16, 16, cart.total)
  },
}
