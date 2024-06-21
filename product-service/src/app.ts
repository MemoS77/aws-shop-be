#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "./stack";

const app = new cdk.App();
// env: { account: '123456789012', region: 'eu-west-1' },
new ProductServiceStack(app, "ProductServiceStack", {});
