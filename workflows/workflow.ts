import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { FetchCalendarEventsDefinition } from "../functions/fetch_calendar_events.ts";
import { SendAttachmentMessageDefinition } from "../functions/send_attachment_message.ts";

const Workflow = DefineWorkflow({
  callback_id: "workflow",
  title: "Send a greeting",
  description: "Send a greeting to channel",
});

const functionStep = Workflow.addStep(
  FetchCalendarEventsDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

Workflow.addStep(
  SendAttachmentMessageDefinition,
  {
    channel_id: functionStep.outputs.channel_id,
    text: functionStep.outputs.text,
    attachments: functionStep.outputs.attachments,
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

export default Workflow;
