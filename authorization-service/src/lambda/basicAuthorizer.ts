const log = (...fields: any) => {
  console.info('AUTH_LOG', ...fields)
}

exports.handler = async (event: any) => {
  log('Starting basicAuthorizer')
  const doResponse = (allow: boolean) => ({
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: allow ? 'Allow' : 'Deny',
          Resource: event.methodArn,
        },
      ],
    },
  })

  const token = process.env.token

  if (!token) throw new Error('No token found in environment variables')

  const authHeader =
    event.headers?.Authorization || event.headers?.authorization

  if (!authHeader) return doResponse(false)

  try {
    const encodedCredentials = authHeader.split(' ')[1]
    log('Header', authHeader)
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64',
    ).toString('utf-8')
    log('Decoded header', decodedCredentials)
    if (decodedCredentials !== token) {
      log('Bad token')
      return doResponse(false)
    }
  } catch (error) {
    return doResponse(false)
  }

  log('Success auth!')
  return doResponse(true)
}
