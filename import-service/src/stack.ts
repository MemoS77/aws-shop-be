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
    })

    const importProductsFileLambda = new lambda.Function(
      this,
      'ImportProductsFileLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'importProductsFile.handler',
        code: lambda.Code.fromAsset(join(__dirname, '../dist/lambda')),
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      },
    )

    bucket.grantReadWrite(importProductsFileLambda)

    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service API',
    })

    const importResource = api.root.addResource('import')
    importResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(importProductsFileLambda),
    )

    const apiGatewayPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`${bucket.bucketArn}/*`],
    })
    importProductsFileLambda.addToRolePolicy(apiGatewayPolicy)

    const importFileParserLambda = new lambda.Function(
      this,
      'ImportFileParserLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'importFileParser.handler',
        code: lambda.Code.fromAsset(join(__dirname, '../dist/lambda')),
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      },
    )

    bucket.grantRead(importFileParserLambda)

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      {
        prefix: 'uploaded/',
      },
    )
  }
}
