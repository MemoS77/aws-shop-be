import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import { join } from 'path'

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'ImportServiceBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'], // Для теста все. В продакшене необходимо: https://d1sqwar1feok6t.cloudfront.net
          allowedHeaders: ['*'],
        },
      ],
    })

    const environment = {
      BUCKET_NAME: bucket.bucketName,
    }

    const importProductsFileLambda = new lambda.Function(
      this,
      'ImportProductsFileLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'importProductsFile.handler',
        code: lambda.Code.fromAsset(join(__dirname, '../dist/lambda')),
        environment,
      },
    )

    bucket.grantReadWrite(importProductsFileLambda)

    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service API',
    })

    const policy = new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:CopyObject',
      ],
      resources: [`${bucket.bucketArn}/*`],
    })

    const importResource = api.root.addResource('import')
    importResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(importProductsFileLambda),
    )

    importProductsFileLambda.addToRolePolicy(policy)

    // Parser
    const importFileParserLambda = new lambda.Function(
      this,
      'ImportFileParserLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'importFileParser.handler',
        code: lambda.Code.fromAsset(join(__dirname, '../dist/lambda')),
        environment,
      },
    )

    importFileParserLambda.addToRolePolicy(policy)
    bucket.grantReadWrite(importFileParserLambda)

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      {
        prefix: 'uploaded/',
      },
    )

    // Delete
    const delFileLambda = new lambda.Function(this, 'DelFileLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'delFile.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../dist/lambda')),
      environment,
    })

    delFileLambda.addToRolePolicy(policy)
    bucket.grantReadWrite(delFileLambda)

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(delFileLambda),
      {
        prefix: 'parsed/',
      },
    )
  }
}
