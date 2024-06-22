import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    /*
    const productsTable = new dynamodb.Table(this, 'products2', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    })

    const stockTable = new dynamodb.Table(this, 'stock2', {
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
    })*/

    const productsTable = dynamodb.Table.fromTableName(
      this,
      'ExistingProductsTable',
      'products',
    )
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'ExistingStocksTable',
      'stocks',
    )

    const environment = {
      TABLE_PRODUCTS: productsTable.tableName,
      TABLE_STOCKS: stocksTable.tableName,
    }

    // Lambda function to get the list of products
    const getProductsList = new lambda.Function(
      this,
      'getProductsListFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'getProductsList.handler',
        environment,
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
        environment,
      },
    )

    productsTable.grantReadData(getProductsList)
    productsTable.grantReadData(getProductsById)
    stocksTable.grantReadData(getProductsList)
    stocksTable.grantReadData(getProductsById)

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
