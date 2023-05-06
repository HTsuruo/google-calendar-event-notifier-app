import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { Event, Events } from "google-calendar-api";
import * as logger from "logger";
import { getTodayStartAndEnd } from "./util.ts";
import { makeEventAttachment } from "./util.ts";

const callback_id = "today_events_function";

export const TodayEventsDefinition = DefineFunction({
  callback_id: callback_id,
  title: "Fetch today calendar events",
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
  TodayEventsDefinition,
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
    const today = getTodayStartAndEnd();
    let events: Event[] | undefined;
    try {
      // Slack platform側で既にOAuthの認証が済んでおり、アクセストークンを取得できているのでライブラリではなくfetchを使う
      // クライアントライブラリでは、GoogleAuthによる認証が必要となるため。
      // ref. https://developers.google.com/calendar/api/v3/reference/events/list?hl=ja
      const res = await fetch(
        // GETではbodyにJSONを渡せないため、クエリパラメータで渡す
        // Error: TypeError: Request with GET/HEAD method cannot have body.
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
        text: `There is ${events?.length} event today`,
        attachments: events?.map((
          event,
        ) =>
          JSON.stringify(
            makeEventAttachment({ event, color: "#3A6FE1" }),
          )
        ),
      },
    };
  },
);
