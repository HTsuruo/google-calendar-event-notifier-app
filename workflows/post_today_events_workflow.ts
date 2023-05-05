import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { TodayCalendarEventsDefinition } from "../functions/today_calendar_events_function.ts";
import { SendAttachmentMessageDefinition } from "../functions/send_attachment_message_function.ts";

const PostTodayEventsWorkflow = DefineWorkflow({
  callback_id: "post_today_events_workflow",
  title: "[Workflow] Post daily events",
});

const dailyEventStep = PostTodayEventsWorkflow.addStep(
  TodayCalendarEventsDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

PostTodayEventsWorkflow.addStep(
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

export default PostTodayEventsWorkflow;
