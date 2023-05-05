import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import * as logger from "logger";

export const SendAttachmentMessageDefinition = DefineFunction({
  callback_id: "send_attachment_message",
  title: "Send attachment message",
  source_file: "functions/send_attachment_message_function.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      text: {
        type: Schema.types.string,
      },
      attachments: {
        type: Schema.types.array,
        items: {
          // TODO(tsuruoka): object型だとエラーになってしまうため、仕方なくstring型にしてJSON文字列を格納している
          type: Schema.types.string,
        },
      },
    },
    required: ["channel_id", "attachments"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  SendAttachmentMessageDefinition,
  async ({ inputs, client }) => {
    const { channel_id, text, attachments } = inputs;
    logger.info(`channel_id: ${channel_id}`);
    const chatResponse = await client.chat.postMessage(
      {
        channel: channel_id,
        text: text,
        attachments: attachments.map((attachment) => JSON.parse(attachment)),
      },
    );
    return {
      outputs: {
        ok: chatResponse.ok,
      },
    };
  },
);
