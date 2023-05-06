import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { SendAttachmentMessageDefinition } from "../functions/send_attachment_message_function.ts";
import { TodayEventsDefinition } from "../functions/today_events_function.ts";

const PostTodayEventsWorkflow = DefineWorkflow({
  callback_id: "post_today_events_workflow",
  title: "[Workflow] Post daily events",
});

const eventStep = PostTodayEventsWorkflow.addStep(
  TodayEventsDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

PostTodayEventsWorkflow.addStep(
  SendAttachmentMessageDefinition,
  {
    channel_id: eventStep.outputs.channel_id,
    text: eventStep.outputs.text,
    attachments: eventStep.outputs.attachments,
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
