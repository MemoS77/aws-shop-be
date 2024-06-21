import mockedList from '../model/db/mockedList'
import { doResponse } from './inc'

export const handler = async () => {
  return doResponse(200, mockedList)
}
