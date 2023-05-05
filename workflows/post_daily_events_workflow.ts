import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { TodayCalendarEventsDefinition } from "../functions/today_calendar_events_function.ts";
import { SendAttachmentMessageDefinition } from "../functions/send_attachment_message_function.ts";

const PostDailyEventsWorkflow = DefineWorkflow({
  callback_id: "post_daily_events_workflow",
  title: "Google Calendar Events Workflow",
});

const dailyEventStep = PostDailyEventsWorkflow.addStep(
  TodayCalendarEventsDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

PostDailyEventsWorkflow.addStep(
  SendAttachmentMessageDefinition,
  {
    channel_id: dailyEventStep.outputs.channel_id,
    text: dailyEventStep.outputs.text,
    attachments: dailyEventStep.outputs.attachments,
  },
);

// Buit-in functions
// ref. https://api.slack.com/automation/functions
// `Schema.slack.functions`に関数が定義されており`addStep`だけで利用できる。
// send_message: https://api.slack.com/reference/functions/send_message
// Workflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: functionStep.outputs.channel_id,
//   // `send_message`ではatatchmentsを付けたメッセージをポストできない
//   message: functionStep.outputs.message,
// });

export default PostDailyEventsWorkflow;
