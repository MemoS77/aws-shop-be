// event
const getProductsList = async (event: unknown) => {
  console.log(event)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ message: 'Hello, World!' }),
  }
}

export default getProductsList
