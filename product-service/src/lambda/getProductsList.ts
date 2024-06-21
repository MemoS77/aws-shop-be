import { getAll } from './db'
import { doResponse } from './inc'

export const handler = async () => {
  const products = await getAll('products')
  if (!products) return doResponse(500, { message: 'DB error' })
  return doResponse(200, products)
}
