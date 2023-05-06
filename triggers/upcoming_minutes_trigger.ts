import { Trigger } from "deno-slack-sdk/types.ts";
import UpcominigEventsWorkflow from "../workflows/upcoming_events_workflow.ts";

const trigger: Trigger<typeof UpcominigEventsWorkflow.definition> = {
  type: "webhook",
  name: "Upcoming events",
  workflow: `#/workflows/${UpcominigEventsWorkflow.definition.callback_id}`,
};

export default trigger;
