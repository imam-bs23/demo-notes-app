import { Auth, use } from "@serverless-stack/resources";
import * as iam from "aws-cdk-lib/aws-iam";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";

export function AuthStack({ stack, app }) {
  const { bucket } = use(StorageStack);
  const { api } = use(ApiStack);

  // Create a Cognito User Pool and Identity Pool
  const auth = new Auth(stack, "Auth", {
    login: ["email"],
  });

  auth.attachPermissionsForAuthUsers(stack, [
    // Allow access to the API
    api,
    // Policy granting access to a specific folder in the bucket
    new iam.PolicyStatement({
      actions: ["s3:*"],
      effect: iam.Effect.ALLOW,
      resources: [
        bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
      ],
    }),
  ]);

  // Show the auth resources in the output
  stack.addOutputs({
    Region: app.region,
    UserPoolId: auth.userPoolId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
    UserPoolClientId: auth.userPoolClientId,
  });

  // Return the auth resource
  return {
    auth,
  };
}
// npx aws-api-gateway-cli-test --username='imamhasan@gmail.com' --password='aA11111111*' --user-pool-id='us-east-1_GfdSVGnZm' --app-client-id='56bfq7aoj7v3ao14olsrg4i69q' --cognito-region='us-east-1' --identity-pool-id='us-east-1:16e36079-5aed-4f7c-b312-93e80a8fcd9f' --invoke-url='https://wo6d2ne8s7.execute-api.us-east-1.amazonaws.com' --api-gateway-region='us-east-1' --path-template='/notes' --method='POST' --body='{"content":"hello world","attachment":"hello.jpg"}'