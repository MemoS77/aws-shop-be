import mockedList from './mockedList'

// event
export const handler = async (event: unknown) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockedList),
  }
}
