import { Trigger } from "deno-slack-sdk/types.ts";
import PostTodayEventsWorkflow from "../workflows/post_today_events_workflow.ts";

const trigger: Trigger<typeof PostTodayEventsWorkflow.definition> = {
  type: "webhook",
  name: "webhook test",
  workflow: `#/workflows/${PostTodayEventsWorkflow.definition.callback_id}`,
};

export default trigger;
