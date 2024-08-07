import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'

import { config } from 'dotenv'

config()

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const login = process.env.AUTH_LOGIN as string
    const pass = process.env.AUTH_PASS as string

    if (!login || !pass) {
      throw new Error('AUTH_LOGIN and AUTH_PASS must be set')
    }

    const environment = {
      token: `${login}:${pass}`,
    }

    const basicAuthorizer = new lambda.Function(
      this,
      'basicAuthorizerFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'basicAuthorizer.handler',
        environment,
      },
    )

    const name = 'BasicAuthorizerLambdaArn'
    new cdk.CfnOutput(this, name, {
      value: basicAuthorizer.functionArn,
      exportName: name,
    })
  }
}
