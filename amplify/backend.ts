import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth,
  data,
});

// AppSync signs requests to Bedrock with the service role it creates for this
// HTTP data source. Do not import or hard-code that generated role.
const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDSv2",
  "https://bedrock-runtime.us-east-1.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "us-east-1",
      signingServiceName: "bedrock",
    },
  },
);

const modelId = "anthropic.claude-sonnet-4-5-20250929-v1:0";

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      // The profile ID is used by bedrock.js in the InvokeModel URL.
      `arn:aws:bedrock:us-east-1:306526296499:inference-profile/us.${modelId}`,
      // A US cross-Region profile can route to several US Regions. Limit the
      // permission to this model while allowing its profile destinations.
      `arn:aws:bedrock:us-*-*::foundation-model/${modelId}`,
    ],
  }),
);
