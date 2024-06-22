import { getAll } from './db'
import { doResponse } from './inc'

export const handler = async () => {
  const products = await getAll('products')
  return doResponse(200, products || [])
}
