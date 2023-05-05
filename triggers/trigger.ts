import { Trigger } from "deno-slack-sdk/types.ts";
import PostDailyEventsWorkflow from "../workflows/post_daily_events_workflow.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const trigger: Trigger<typeof PostDailyEventsWorkflow.definition> = {
  type: "shortcut",
  name: "Send a greeting",
  description: "Send greeting to channel",
  workflow: "#/workflows/post_daily_events_workflow",
};

export default trigger;
