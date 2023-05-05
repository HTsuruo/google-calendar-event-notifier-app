import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import * as logger from "logger";
export const SendAttachmentMessageDefinition = DefineFunction({
  callback_id: "send_attachment_message",
  title: "Send attachment message",
  source_file: "functions/send_attachment_message.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
        title: "Select a channel",
        description: "Search all channels",
      },
      text: {
        type: Schema.types.string,
        title: "Select a channel",
        description: "Search all channels",
      },
      attachment: {
        type: Schema.types.object,
        title: "Select a channel",
        description: "Search all channels",
      },
    },
    required: ["channel_id", "attachment"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  SendAttachmentMessageDefinition,
  async ({ inputs, client }) => {
    const { channel_id, text, attachment } = inputs;
    logger.info(`channel_id: ${channel_id}`);
    const chatResponse = await client.chat.postMessage(
      {
        channel: channel_id,
        text: text,
        attachments: [
          attachment,
          attachment,
        ],
      },
    );
    return {
      outputs: {
        ok: chatResponse.ok,
      },
    };
  },
);

export type Attachment = {
  readonly color: string;
  readonly pretext: string;
  readonly title: string;
  readonly title_link: string;
};
