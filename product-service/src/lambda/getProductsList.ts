import { doResponse } from './inc'
import mockedList from './mockedList'

export const handler = async () => {
  return doResponse(200, mockedList)
}
