import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { Calendar } from "https://googleapis.deno.dev/v1/calendar:v3.ts";
import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";
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

    const calendar = new Calendar();

    const calendarId =
      "nttdocomo.com_02men4phbni9jtk15ndgp1udi8@group.calendar.google.com";
    const now = datetime();
    const today = datetime(
      {
        year: now.year,
        month: now.month,
        day: now.day,
      },
    );
    const events = await calendar.eventsList(calendarId, {
      timeMax: today.toJSDate(),
      timeMin: today.add({ day: 1 }).toJSDate(),
    });
    console.log(`events: ${JSON.stringify(events)}`);

    // ref. https://developers.google.com/calendar/api/v3/reference
    // const calendarId = "primary";
    // const res = fetch(
    //   `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`,
    // );

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
        message: `ありがとうございました`,
      },
    };
  },
);
