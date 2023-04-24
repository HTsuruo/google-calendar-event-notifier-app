import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FunctionDefinition } from "../functions/function.ts";

const Workflow = DefineWorkflow({
  callback_id: "workflow",
  title: "Send a greeting",
  description: "Send a greeting to channel",
});

const functionStep = Workflow.addStep(
  FunctionDefinition,
  {},
);

Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: "C02SV0FPLGP",
  message: functionStep.outputs.greeting,
});

export default Workflow;
