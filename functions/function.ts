import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { Event, Events } from "google-calendar-api";
import { datetime } from "ptera/mod.ts";
import * as logger from "logger";
import { Attachment } from "./send_attachment_message.ts";
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
      text: {
        type: Schema.types.string,
        description: "Greeting for the recipient",
      },
      attachment: {
        type: Schema.types.object,
        description: "Greeting for the recipient",
      },
    },
    required: ["channel_id", "attachment"],
  },
});

export default SlackFunction(
  FunctionDefinition,
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
          `&timeMax=${today.end.toISOString()}`,
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
      logger.info(`items: ${Deno.inspect(json.items, { compact: false })}`);
      events = json.items;
    } catch (error) {
      logger.error(error);
      return { error };
    }
    return {
      outputs: {
        channel_id: env.SLACK_CHANNEL_ID,
        text: events?.at(0)?.summary ?? "",
        attachment: {
          color: "#000",
          pretext: "これはプレテキストです",
          title: "タイトルです",
          title_link: "https://api.slack.com/lang/ja-jp",
        } as Attachment,
      },
    };
  },
);

// 今日の0時と24時を取得する
function getTodayStartAndEnd(): { start: Date; end: Date } {
  const now = datetime();
  const today = datetime(
    {
      year: now.year,
      month: now.month,
      day: now.day,
    },
  );
  const afterDay = today.add({ day: 1 });
  const startAndEnd = {
    start: today.toJSDate(),
    end: afterDay.toJSDate(),
  };
  logger.info(`today: ${Deno.inspect(startAndEnd, { compact: false })}`);
  return startAndEnd;
}
