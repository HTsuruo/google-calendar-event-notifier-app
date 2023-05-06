import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getNowAndUpcomingMinutes } from "./util.ts";
import { makeEventAttachment } from "./util.ts";
import { fetchCalendarEvents } from "./google_calendar_api.ts";

const callback_id = "upcoming_events_function";
const minute = 15;

export const UpcomingEventsDefinition = DefineFunction({
  callback_id: callback_id,
  title: "Fetch upcoming calendar events",
  source_file: `functions/${callback_id}.ts`,
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
      },
      text: {
        type: Schema.types.string,
      },
      attachments: {
        type: Schema.types.array,
        items: {
          type: Schema.types.string,
        },
      },
    },
    required: ["channel_id"],
  },
});

export default SlackFunction(
  UpcomingEventsDefinition,
  async ({ inputs, client, env }) => {
    const tokenResponse = await client.apps.auth.external.get({
      external_token_id: inputs.googleAccessTokenId,
    });
    if (tokenResponse.error) {
      throw new Error(
        "Failed to retrieve the external auth token due to [${tokenResponse.error}]",
      );
    }
    const externalToken = tokenResponse.external_token;
    if (!externalToken) {
      throw new Error("Cannot get externalToken");
    }

    const { start, end } = getNowAndUpcomingMinutes({ minute });
    const events = await fetchCalendarEvents(
      {
        externalToken,
        calendarId: env.CALENDAR_ID,
        timeMin: start,
        timeMax: end,
      },
    );
    return {
      outputs: {
        channel_id: env.SLACK_CHANNEL_ID,
        text: `${minute}分後にイベントが開始します`,
        attachments: events?.map((
          event,
        ) => JSON.stringify(makeEventAttachment({ event, color: "#FF82B2" }))),
      },
    };
  },
);
