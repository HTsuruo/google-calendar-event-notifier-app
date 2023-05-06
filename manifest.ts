import { DefineOAuth2Provider, Manifest, Schema } from "deno-slack-sdk/mod.ts";
import PostTodayEventsWorkflow from "./workflows/post_today_events_workflow.ts";
import UpcominigEventsWorkflow from "./workflows/upcoming_events_workflow.ts";

const GoogleProvider = DefineOAuth2Provider({
  provider_key: "google",
  provider_type: Schema.providers.oauth2.CUSTOM,
  options: {
    provider_name: "Google",
    authorization_url: "https://accounts.google.com/o/oauth2/auth",
    token_url: "https://oauth2.googleapis.com/token",
    client_id:
      "512307413488-rgadlpv34sdccj9qc1o6uj4iuk45v8em.apps.googleusercontent.com",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    authorization_url_extras: {
      prompt: "consent",
      access_type: "offline",
    },
    identity_config: {
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
      account_identifier: "$.email",
    },
  },
});

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  // name: must be less than 36 characters (failed_constraint)
  name: "Google Calendar Event",
  description:
    "A alternative Google Calendar for Team Events. This app notifies Google Calendar events to Slack channel.",
  icon: "assets/default_new_app_icon.png",
  workflows: [PostTodayEventsWorkflow, UpcominigEventsWorkflow],
  externalAuthProviders: [GoogleProvider],
  outgoingDomains: [
    "googleapis.deno.dev",
    "www.googleapis.com",
  ],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
