import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const FunctionDefinition = DefineFunction({
  callback_id: "function",
  title: "Generate a greeting",
  description: "Generate a greeting",
  source_file: "functions/function.ts",
  input_parameters: {
    properties: {
      googleAccessTokenId: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "google",
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Greeting for the recipient",
      },
    },
    required: ["message"],
  },
});

export default SlackFunction(
  FunctionDefinition,
  async ({ inputs, client }) => {
    const tokenResponse = await client.apps.auth.external.get({
      external_token_id: inputs.googleAccessTokenId,
    });
    console.log(`tokenResponse: ${JSON.stringify(tokenResponse)}`);
    if (tokenResponse.error) {
      const error =
        `Failed to retrieve the external auth token due to [${tokenResponse.error}]`;
      return { error };
    }
    const externalToken = tokenResponse.external_token;
    console.log(`externalToken: ${externalToken}`);
    // const client = await authenticate({
    //   // ref. https://developers.google.com/identity/protocols/oauth2/scopes?hl=ja#calendar
    //   scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    //   keyfilePath:
    // });
    // if (client.credentials) {
    //   console.info(client.credentials);
    // }
    return {
      outputs: {
        message: `ありがとうございました: ${inputs.googleAccessTokenId}`,
      },
    };
  },
);
