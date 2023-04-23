import { DefineWorkflow, Schema } from 'deno-slack-sdk/mod.ts'
import { GreetingFunctionDefinition } from '../functions/greeting_function.ts'

const GreetingWorkflow = DefineWorkflow({
  callback_id: 'greeting_workflow',
  title: 'Send a greeting',
  description: 'Send a greeting to channel',
})

const greetingFunctionStep = GreetingWorkflow.addStep(
  GreetingFunctionDefinition,
  {}
)

GreetingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: 'C02SV0FPLGP',
  message: greetingFunctionStep.outputs.greeting,
})

export default GreetingWorkflow
