import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { SendAttachmentMessageDefinition } from "../functions/send_attachment_message_function.ts";
import { UpcomingEventsDefinition } from "../functions/upcoming_events_function.ts";

const UpcominigEventsWorkflow = DefineWorkflow({
  callback_id: "upcoming_events_workflow",
  title: "[Workflow] Post upcominig events",
});

const eventStep = UpcominigEventsWorkflow.addStep(
  UpcomingEventsDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

UpcominigEventsWorkflow.addStep(
  SendAttachmentMessageDefinition,
  {
    channel_id: eventStep.outputs.channel_id,
    text: eventStep.outputs.text,
    attachments: eventStep.outputs.attachments,
  },
);
export default UpcominigEventsWorkflow;
