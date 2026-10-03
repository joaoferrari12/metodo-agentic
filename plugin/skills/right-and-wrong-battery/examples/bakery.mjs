// Fictional "Crumb & Co." bakery. Invented for this example; not taken from any real system.

// Orders saved before the cart format changed stored `qty` as a string and had no `v` field.
export const migrate = (order) => (order.v === 2 ? order : {
  v: 2,
  lines: order.lines.map((l) => ({ sku: l.sku, qty: Number(l.qty) })),
})

export function reorder(pastOrder, stock, prices) {
  const order = migrate(pastOrder)
  const lines = order.lines.map((l) => {
    const soldOut = (stock[l.sku] ?? 0) < l.qty
    return { sku: l.sku, qty: l.qty, price: prices[l.sku], flag: soldOut ? 'sold-out' : 'ok' }
  })
  const total = lines.filter((l) => l.flag === 'ok').reduce((s, l) => s + l.qty * l.price, 0)
  return { lines, total: Math.round(total * 100) / 100 }
}
