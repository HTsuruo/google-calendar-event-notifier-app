import { Trigger } from "deno-slack-sdk/types.ts";
import PostTodayEventsWorkflow from "../workflows/post_today_events_workflow.ts";

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
