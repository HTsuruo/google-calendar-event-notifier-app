import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getDateTime, makeEventAttachment } from "./util.ts";
import { fetchCalendarEvents } from "./google_calendar_api.ts";
import { datetime } from "ptera/mod.ts";

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
      skip_send_message: {
        type: Schema.types.boolean,
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

    const now = getDateTime();
    const afterMinutesFromNow = now.add({ minute });
    const { start, end } = {
      start: now.toJSDate(),
      end: afterMinutesFromNow.toJSDate(),
    };
    const events = await fetchCalendarEvents(
      {
        externalToken,
        calendarId: env.CALENDAR_ID,
        timeMin: start,
        timeMax: end,
      },
    );
    const filteredEvents = events!.filter((e) => {
      const startTime = datetime(e.start?.dateTime!);
      const endTime = datetime(e.end?.dateTime!);

      // 終日イベント判定
      const isAllDayEvent = startTime.hour === endTime.hour &&
        startTime.minute === endTime.minute &&
        startTime.second === endTime.second;

      // 単一イベントかつ開始時間のみが対象（15分おきに実行されるためイベント中も含まれてしまう問題の対処）
      return !isAllDayEvent && startTime.isBetween(now, afterMinutesFromNow);
    });

    return {
      outputs: {
        channel_id: env.SLACK_CHANNEL_ID,
        skip_send_message: filteredEvents.length < 1,
        text: `${minute}分後にイベントが開始します`,
        attachments: filteredEvents?.map((
          event,
        ) => JSON.stringify(makeEventAttachment({ event, color: "#FF82B2" }))),
      },
    };
  },
);
