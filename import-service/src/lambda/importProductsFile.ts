import * as AWS from 'aws-sdk'
import { doResponse } from './inc'
const s3 = new AWS.S3()
const bucketName = 'ImportServiceBucket' //process.env.BUCKET_NAME

exports.handler = async (event: any) => {
  const fileName = event.queryStringParameters.name
  const s3Params = {
    Bucket: bucketName,
    Key: `uploaded/${fileName}`,
    Expires: 120,
  }

  try {
    const signedUrl = s3.getSignedUrl('putObject', s3Params)
    return doResponse(200, { signedUrl })
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      message: 'Failed to generate signed URL',
    }
  }
}
