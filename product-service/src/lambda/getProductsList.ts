import { doResponse } from './inc'
import mockedList from './mockedList'

export const handler = async (_event: unknown) => {
  return doResponse(200, mockedList)
}
