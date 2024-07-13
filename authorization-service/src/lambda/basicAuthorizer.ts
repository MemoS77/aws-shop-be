exports.handler = async (event: any) => {
  const token = process.env.token
  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          'Internal Server Error: No token found in environment variables',
      }),
    }
  }

  const authHeader =
    event.headers?.Authorization || event.headers?.authorization

  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    }
  }

  const encodedCredentials = authHeader.split(' ')[1]
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf-8',
  )

  if (decodedCredentials !== token) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden' }),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Authorized' }),
  }
}
