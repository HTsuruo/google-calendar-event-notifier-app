import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import Function from "./function.ts";

const { createContext } = SlackFunctionTester("function");

Deno.test("Function test", async () => {
  const inputs = { message: "Welcome to the team!" };
  const { outputs } = await Function(createContext({ inputs }));
  assertEquals(
    outputs?.greeting.includes("Welcome to the team!"),
    true,
  );
});
