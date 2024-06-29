import { APIGatewayProxyHandler } from 'aws-lambda'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { doResponse } from './inc'

const s3Client = new S3Client({})

const bucketName = process.env.BUCKET_NAME!

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name
  if (!fileName) {
    return doResponse(400, { message: 'Name required' })
  }

  const s3Params = {
    Bucket: bucketName,
    Key: `uploaded/${fileName}`,
  }

  try {
    const command = new PutObjectCommand(s3Params)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 })

    return doResponse(200, { signedUrl })
  } catch (error) {
    console.error(error)
    return doResponse(500, { message: 'Failed to generate signed URL' })
  }
}
