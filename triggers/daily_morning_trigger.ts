import { Trigger } from "deno-slack-sdk/types.ts";
import PostTodayEventsWorkflow from "../workflows/post_today_events_workflow.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/future/triggers
 */
const trigger: Trigger<typeof PostTodayEventsWorkflow.definition> = {
  type: "scheduled",
  name: "Post daily events at 9:00 AM",
  workflow: `#/workflows/${PostTodayEventsWorkflow.definition.callback_id}`,
  schedule: {
    start_time: "2023-05-06T09:00:00Z",
    frequency: {
      type: "weekly",
      // TODO(tsuruoka): テスト的にSaturdayを入れているが、本番適用時には削除する
      on_days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
  },
};

export default trigger;
