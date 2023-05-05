import { Trigger } from "deno-slack-sdk/types.ts";
import PostTodayEventsWorkflow from "../workflows/post_today_events_workflow.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const trigger: Trigger<typeof PostTodayEventsWorkflow.definition> = {
  type: "shortcut",
  name: "Post daily events at 9:00 AM",
  workflow: `#/workflows/${PostTodayEventsWorkflow.definition.callback_id}`,
};

export default trigger;
