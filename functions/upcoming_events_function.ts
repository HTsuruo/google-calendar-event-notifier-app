import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { Event, Events } from "google-calendar-api";
import * as logger from "logger";
import { getNowAndUpcomingMinutes } from "./util.ts";
import { makeEventAttachment } from "./util.ts";

const callback_id = "upcoming_events_function";
const triggerMinutes = 15;

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
      const error =
        `Failed to retrieve the external auth token due to [${tokenResponse.error}]`;
      return { error };
    }
    const externalToken = tokenResponse.external_token;
    logger.info(`externalToken: ${externalToken}`);

    const calendarId = env.CALENDAR_ID;
    const today = getNowAndUpcomingMinutes({ minute: triggerMinutes });
    let events: Event[] | undefined;
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
          `?timeMin=${today.start.toISOString()}` +
          `&timeMax=${today.end.toISOString()}` +
          `&singleEvents=true` +
          `&orderBy=startTime`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${externalToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) {
        return { error: res.statusText };
      }
      const json: Events = await res.json();
      events = json.items;
    } catch (error) {
      logger.error(error);
      return { error };
    }
    return {
      outputs: {
        channel_id: env.SLACK_CHANNEL_ID,
        text: `${triggerMinutes}分後にイベントが開始します`,
        attachments: events?.map((
          event,
        ) => JSON.stringify(makeEventAttachment(event))),
      },
    };
  },
);
