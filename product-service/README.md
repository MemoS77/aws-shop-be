# Welcome to your CDK TypeScript project

API URL: https://ppg1z1ffui.execute-api.eu-west-1.amazonaws.com/prod

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Local launch with Docker and SAM

`sam local start-api --template cdk.out/ProductServiceStack.template.json`

## Get openapi.json

But, without response scheme.
`aws apigateway get-export --rest-api-id ppg1z1ffui --stage-name prod --export-type swagger openapi.json`
