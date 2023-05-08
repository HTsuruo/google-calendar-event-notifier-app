import { Trigger } from "deno-slack-sdk/types.ts";
import PostTodayEventsWorkflow from "../workflows/post_today_events_workflow.ts";
import { timezone } from "../functions/util.ts";

const trigger: Trigger<typeof PostTodayEventsWorkflow.definition> = {
  type: "scheduled",
  name: "Post daily events at 9:00 AM",
  workflow: `#/workflows/${PostTodayEventsWorkflow.definition.callback_id}`,
  schedule: {
    start_time: "2023-05-08T09:00:00+09:00",
    timezone: timezone,
    frequency: {
      type: "weekly",
      on_days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
    },
  },
};

export default trigger;
