import { Event, Events } from "google-calendar-api";
import * as logger from "logger";

export async function fetchCalendarEvents(param: {
  externalToken: string;
  calendarId: string;
  timeMin: Date;
  timeMax: Date;
}): Promise<Event[] | undefined> {
  const { externalToken, calendarId, timeMin, timeMax } = param;
  try {
    // Slack platform側で既にOAuthの認証が済んでおり、アクセストークンを取得できているのでライブラリではなくfetchを使う
    // クライアントライブラリでは、GoogleAuthによる認証が必要となるため。
    // ref. https://developers.google.com/calendar/api/v3/reference/events/list?hl=ja
    const res = await fetch(
      // GETではbodyにJSONを渡せないため、クエリパラメータで渡す
      // Error: TypeError: Request with GET/HEAD method cannot have body.
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
        `?timeMin=${timeMin.toISOString()}` +
        `&timeMax=${timeMax.toISOString()}` +
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
      logger.error({ error: res.statusText });
      return;
    }
    const json: Events = await res.json();
    return json.items;
  } catch (error) {
    logger.error(error);
    return;
  }
}
