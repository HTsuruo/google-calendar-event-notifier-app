import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { Event, Events } from "google-calendar-api";
import { datetime } from "ptera/mod.ts";
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
      channel_id: {
        type: Schema.types.string,
        description: "Slack channel id to send outputs",
      },
      message: {
        type: Schema.types.string,
        description: "Greeting for the recipient",
      },
    },
    required: ["channel_id"],
  },
});

export default SlackFunction(
  FunctionDefinition,
  async ({ inputs, client, env }) => {
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

    const calendarId = env.CALENDAR_ID;
    const now = datetime();
    const today = datetime(
      {
        year: now.year,
        month: now.month,
        day: now.day,
      },
    );
    console.log(`timeMin: ${today.toJSDate().toISOString()}`);
    console.log(`timeMax: ${today.add({ day: 1 }).toJSDate().toISOString()}`);
    let events: Event[] | undefined;
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${"2023-05-05T00:00:00Z"}&timeMax=${"2023-05-06T00:00:00Z"}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${externalToken}`,
            "Content-Type": "application/json",
          },
          // Error: TypeError: Request with GET/HEAD method cannot have body.
          // body: JSON.stringify({
          //   timeMax: today.toJSDate(),
          //   timeMin: today.add({ day: 1 }).toJSDate(),
          // } as EventsListOptions),
        },
      );
      if (!res.ok) {
        return { error: res.statusText };
      }
      const json: Events = await res.json();
      console.log(`items: ${JSON.stringify(json.items)}`);
      events = json.items;
    } catch (error) {
      console.error(error);
      return { error };
    }
    return {
      outputs: {
        channel_id: env.SLACK_CHANNEL_ID,
        message: events?.at(0)?.summary ?? "",
      },
    };
  },
);
