import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FunctionDefinition } from "../functions/function.ts";

const Workflow = DefineWorkflow({
  callback_id: "workflow",
  title: "Send a greeting",
  description: "Send a greeting to channel",
});

const functionStep = Workflow.addStep(
  FunctionDefinition,
  {
    googleAccessTokenId: {
      credential_source: "DEVELOPER",
    },
  },
);

// Buit-in functions
// ref. https://api.slack.com/automation/functions
// `Schema.slack.functions`に関数が定義されており`addStep`だけで利用できる。
Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: functionStep.outputs.channel_id,
  message: functionStep.outputs.message,
});

export default Workflow;
