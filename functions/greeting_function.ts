import { DefineFunction, Schema, SlackFunction } from 'deno-slack-sdk/mod.ts'

export const GreetingFunctionDefinition = DefineFunction({
  callback_id: 'greeting_function',
  title: 'Generate a greeting',
  description: 'Generate a greeting',
  source_file: 'functions/greeting_function.ts',
  input_parameters: {
    properties: {
      googleAccessTokenId: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: 'google',
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      greeting: {
        type: Schema.types.string,
        description: 'Greeting for the recipient',
      },
    },
    required: ['greeting'],
  },
})

export default SlackFunction(
  GreetingFunctionDefinition,
  async ({ inputs, client }) => {
    const tokenResponse = await client.apps.auth.external.get({
      external_token_id: inputs.googleAccessTokenId,
    })
    console.log(`tokenResponse: ${JSON.stringify(tokenResponse)}`)
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
        greeting: `ありがとうございました: ${inputs.googleAccessTokenId}`,
      },
    }
  }
)
