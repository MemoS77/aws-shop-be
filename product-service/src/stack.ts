import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Lambda function to get the list of products
    const getProductsList = new lambda.Function(
      this,
      'getProductsListFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'getProductsList.handler',
      },
    )

    // Lambda function to get a product by ID
    const getProductsById = new lambda.Function(
      this,
      'getProductsByIdFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'getProductsById.handler',
      },
    )

    // Create API Gateway
    const api = new apigateway.LambdaRestApi(this, 'productsApi', {
      handler: getProductsList, // Default handler
      proxy: false,
    })

    // Create 'products' resource
    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET') // GET /products

    // Create '{id}' resource under 'products'
    const productByIdResource = productsResource.addResource('{id}')
    productByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsById),
    ) // GET /products/{id}
  }
}
