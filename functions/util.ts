import { DateTime, datetime } from "ptera/mod.ts";
import type { Event } from "google-calendar-api";
import * as logger from "logger";
import { Attachment } from "./type.ts";

// タイムゾーン固定して現在時刻を取得するラッパー
// ローカル開発の`slack run`では`Asia/Tokyo`になっているが、デプロイ時には`UTC`になるため固定が必須
export function getDateTime(): DateTime {
  return datetime(undefined, {
    // Change the timezone to your required timezone
    timezone: "Asia/Tokyo",
  });
}

// 今日の0時と24時を取得する
export function getTodayStartAndEnd(): { start: Date; end: Date } {
  const now = getDateTime();
  const today = datetime(
    {
      year: now.year,
      month: now.month,
      day: now.day,
    },
  );
  const tommorow = today.add({ day: 1 });
  const startAndEnd = {
    start: today.toJSDate(),
    end: tommorow.toJSDate(),
  };
  logger.info(Deno.inspect(startAndEnd, { compact: false }));
  return startAndEnd;
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
