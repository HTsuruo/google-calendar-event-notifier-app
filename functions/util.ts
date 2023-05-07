import { DateTime, datetime } from "ptera/mod.ts";
import type { Event } from "google-calendar-api";
import * as logger from "logger";
import { Attachment } from "./type.ts";

// ローカル開発の`slack run`では`Asia/Tokyo`になっているが、デプロイ時には`UTC`になるため指定する
const timezone = "Asia/Tokyo";

// 今日の0時と24時を取得する
export function getTodayStartAndEnd(): { start: Date; end: Date } {
  const now = datetime();
  const today = datetime(
    {
      year: now.year,
      month: now.month,
      day: now.day,
    },
  );
  const tommorow = today.add({ day: 1 });
  return formatStartAndEndTime({ start: today, end: tommorow });
}

export function formatStartAndEndTime(
  param: { start: DateTime; end: DateTime },
) {
  const { start, end } = param;
  const startAndEndTime = {
    start: start.toZonedTime(timezone).toJSDate(),
    end: end.toZonedTime(timezone).toJSDate(),
  };
  logger.info(Deno.inspect(startAndEndTime, { compact: false }));
  return startAndEndTime;
}

// Calendar EventをもとにSlackのAttachmentを作成する
export function makeEventAttachment(
  param: { event: Event; color: string },
): Attachment {
  const { event, color } = param;
  let text = formatEventDate(event);
  if (event.description) {
    text += `\n${event.description}`;
  }
  if (event.location) {
    text += `\n${event.location}`;
  }
  return {
    color: color,
    title: event.summary,
    title_link: event.htmlLink,
    text: text,
    footer: `Created by: ${event.creator?.email}`,
  } as Attachment;
}

function formatEventDate(event: Event) {
  const startTime = datetime(event.start?.dateTime);
  const endTime = datetime(event.end?.dateTime);
  // 終日イベントの場合は時刻を表示しなし
  // ex: `2023-01-01`表示となり時刻がのらないため、そこで判別する
  if (startTime.hour === endTime.hour && startTime.minute === endTime.minute) {
    return "終日";
  }
  return `${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}`;
}
